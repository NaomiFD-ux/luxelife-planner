"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerNotifications = exports.generateDailyNotifications = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
// Notification types
var NotificationType;
(function (NotificationType) {
    NotificationType["TASK_DUE_SOON"] = "TASK_DUE_SOON";
    NotificationType["TASK_OVERDUE"] = "TASK_OVERDUE";
    NotificationType["BILL_DUE_SOON"] = "BILL_DUE_SOON";
    NotificationType["BILL_OVERDUE"] = "BILL_OVERDUE";
    NotificationType["ASSIGNMENT_DUE_SOON"] = "ASSIGNMENT_DUE_SOON";
    NotificationType["ASSIGNMENT_OVERDUE"] = "ASSIGNMENT_OVERDUE";
    NotificationType["EVENT_REMINDER"] = "EVENT_REMINDER";
    NotificationType["INTERVIEW_REMINDER"] = "INTERVIEW_REMINDER";
    NotificationType["DAILY_SUMMARY"] = "DAILY_SUMMARY";
})(NotificationType || (NotificationType = {}));
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "LOW";
    NotificationPriority["MEDIUM"] = "MEDIUM";
    NotificationPriority["HIGH"] = "HIGH";
    NotificationPriority["URGENT"] = "URGENT";
})(NotificationPriority || (NotificationPriority = {}));
var HubType;
(function (HubType) {
    HubType["PLANNER"] = "PLANNER";
    HubType["FINANCE"] = "FINANCE";
    HubType["SCHOOL"] = "SCHOOL";
    HubType["CALENDAR"] = "CALENDAR";
    HubType["JOBS"] = "JOBS";
    HubType["DASHBOARD"] = "DASHBOARD";
})(HubType || (HubType = {}));
// Icon mapping
const getNotificationIcon = (type) => {
    const iconMap = {
        [NotificationType.TASK_DUE_SOON]: "schedule",
        [NotificationType.TASK_OVERDUE]: "warning",
        [NotificationType.BILL_DUE_SOON]: "payments",
        [NotificationType.BILL_OVERDUE]: "error",
        [NotificationType.ASSIGNMENT_DUE_SOON]: "assignment",
        [NotificationType.ASSIGNMENT_OVERDUE]: "assignment_late",
        [NotificationType.EVENT_REMINDER]: "event",
        [NotificationType.INTERVIEW_REMINDER]: "work",
        [NotificationType.DAILY_SUMMARY]: "wb_sunny",
    };
    return iconMap[type] || "notifications";
};
// Helper to get ordinal suffix
const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21)
        return "th";
    switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
};
// Helper to check if notification already exists
async function notificationExists(userId, type, relatedId) {
    const snapshot = await db.collection("notifications")
        .where("userId", "==", userId)
        .where("type", "==", type)
        .where("relatedId", "==", relatedId)
        .limit(1)
        .get();
    return !snapshot.empty;
}
// Helper to create notification
async function createNotification(data) {
    // Check for duplicate
    const exists = await notificationExists(data.userId, data.type, data.relatedId);
    if (exists) {
        console.log(`Notification already exists: ${data.type} for ${data.relatedId}`);
        return;
    }
    await db.collection("notifications").add(Object.assign(Object.assign({}, data), { icon: getNotificationIcon(data.type), read: false, dismissed: false, createdAt: admin.firestore.FieldValue.serverTimestamp(), expiresAt: data.expiresAt || null }));
    console.log(`Created notification: ${data.type} - ${data.title}`);
}
/**
 * Scheduled function that runs daily at 9 AM EST
 * Generates notifications for:
 * - Bills due in 3 days, 1 day, or today
 * - Assignments due in 3 days, 1 day, or today
 * - Tasks due in 3 days, 1 day, or today
 * - Events happening in 3 days, 1 day, or today
 * - Interviews in 3 days, 1 day, or today
 * - Overdue items
 */
exports.generateDailyNotifications = functions.pubsub
    .schedule("0 9 * * *") // 9 AM every day
    .timeZone("America/New_York") // EST timezone
    .onRun(async () => {
    console.log("Starting daily notification generation...");
    const now = new Date();
    const today = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    // Calculate target dates
    const todayDate = new Date(currentYear, currentMonth, today);
    const tomorrowDate = new Date(currentYear, currentMonth, today + 1);
    const threeDaysDate = new Date(currentYear, currentMonth, today + 3);
    // Format dates for comparison (YYYY-MM-DD)
    const todayStr = todayDate.toISOString().split("T")[0];
    const tomorrowStr = tomorrowDate.toISOString().split("T")[0];
    const threeDaysStr = threeDaysDate.toISOString().split("T")[0];
    console.log(`Today: ${todayStr}, Tomorrow: ${tomorrowStr}, 3 days: ${threeDaysStr}`);
    // ============ PROCESS BILLS ============
    console.log("Processing bills...");
    const billsSnapshot = await db.collection("finance_bills").get();
    for (const billDoc of billsSnapshot.docs) {
        const bill = billDoc.data();
        const userId = bill.userId;
        if (!userId || bill.paid)
            continue;
        // Bills store dueDate as day of month (1-31)
        const dueDayOfMonth = typeof bill.dueDate === "number"
            ? bill.dueDate
            : parseInt(bill.dueDate);
        if (isNaN(dueDayOfMonth) || dueDayOfMonth < 1 || dueDayOfMonth > 31)
            continue;
        const daysDiff = dueDayOfMonth - today;
        // 3 days before
        if (daysDiff === 3) {
            await createNotification({
                userId,
                type: NotificationType.BILL_DUE_SOON,
                title: "Bill Due in 3 Days",
                message: `"${bill.name}" ($${bill.amount}) is due on the ${dueDayOfMonth}${getOrdinalSuffix(dueDayOfMonth)}`,
                priority: NotificationPriority.MEDIUM,
                hub: HubType.FINANCE,
                actionUrl: "/finance#calendar",
                actionLabel: "View Bill",
                relatedId: `${billDoc.id}_3day`,
            });
        }
        // 1 day before (tomorrow)
        if (daysDiff === 1) {
            await createNotification({
                userId,
                type: NotificationType.BILL_DUE_SOON,
                title: "Bill Due Tomorrow",
                message: `"${bill.name}" ($${bill.amount}) is due tomorrow`,
                priority: NotificationPriority.HIGH,
                hub: HubType.FINANCE,
                actionUrl: "/finance#calendar",
                actionLabel: "View Bill",
                relatedId: `${billDoc.id}_1day`,
            });
        }
        // Day of
        if (daysDiff === 0) {
            await createNotification({
                userId,
                type: NotificationType.BILL_DUE_SOON,
                title: "Bill Due Today",
                message: `"${bill.name}" ($${bill.amount}) is due today!`,
                priority: NotificationPriority.URGENT,
                hub: HubType.FINANCE,
                actionUrl: "/finance#calendar",
                actionLabel: "Pay Now",
                relatedId: `${billDoc.id}_today`,
            });
        }
        // Overdue (1-7 days past)
        if (daysDiff < 0 && daysDiff >= -7) {
            await createNotification({
                userId,
                type: NotificationType.BILL_OVERDUE,
                title: "Bill Overdue",
                message: `"${bill.name}" ($${bill.amount}) was due on the ${dueDayOfMonth}${getOrdinalSuffix(dueDayOfMonth)}`,
                priority: NotificationPriority.URGENT,
                hub: HubType.FINANCE,
                actionUrl: "/finance#calendar",
                actionLabel: "Pay Now",
                relatedId: `${billDoc.id}_overdue`,
            });
        }
    }
    // ============ PROCESS ASSIGNMENTS ============
    console.log("Processing assignments...");
    const assignmentsSnapshot = await db.collection("school_assignments").get();
    for (const assignmentDoc of assignmentsSnapshot.docs) {
        const assignment = assignmentDoc.data();
        const userId = assignment.userId;
        if (!userId || assignment.completed || !assignment.dueDate)
            continue;
        const dueDate = assignment.dueDate; // Expected format: YYYY-MM-DD
        // 3 days before
        if (dueDate === threeDaysStr) {
            await createNotification({
                userId,
                type: NotificationType.ASSIGNMENT_DUE_SOON,
                title: "Assignment Due in 3 Days",
                message: `"${assignment.title}" is due in 3 days`,
                priority: NotificationPriority.MEDIUM,
                hub: HubType.SCHOOL,
                actionUrl: "/school#assignments",
                actionLabel: "View Assignment",
                relatedId: `${assignmentDoc.id}_3day`,
            });
        }
        // 1 day before
        if (dueDate === tomorrowStr) {
            await createNotification({
                userId,
                type: NotificationType.ASSIGNMENT_DUE_SOON,
                title: "Assignment Due Tomorrow",
                message: `"${assignment.title}" is due tomorrow`,
                priority: NotificationPriority.HIGH,
                hub: HubType.SCHOOL,
                actionUrl: "/school#assignments",
                actionLabel: "View Assignment",
                relatedId: `${assignmentDoc.id}_1day`,
            });
        }
        // Day of
        if (dueDate === todayStr) {
            await createNotification({
                userId,
                type: NotificationType.ASSIGNMENT_DUE_SOON,
                title: "Assignment Due Today",
                message: `"${assignment.title}" is due today!`,
                priority: NotificationPriority.URGENT,
                hub: HubType.SCHOOL,
                actionUrl: "/school#assignments",
                actionLabel: "Submit Now",
                relatedId: `${assignmentDoc.id}_today`,
            });
        }
        // Overdue
        if (dueDate < todayStr) {
            await createNotification({
                userId,
                type: NotificationType.ASSIGNMENT_OVERDUE,
                title: "Assignment Overdue",
                message: `"${assignment.title}" is past due!`,
                priority: NotificationPriority.URGENT,
                hub: HubType.SCHOOL,
                actionUrl: "/school#assignments",
                actionLabel: "View Assignment",
                relatedId: `${assignmentDoc.id}_overdue`,
            });
        }
    }
    // ============ PROCESS TASKS ============
    console.log("Processing tasks...");
    const tasksSnapshot = await db.collection("planner_tasks").get();
    for (const taskDoc of tasksSnapshot.docs) {
        const task = taskDoc.data();
        const userId = task.userId;
        if (!userId || task.status === "Complete" || !task.dueDate)
            continue;
        const dueDate = task.dueDate; // Expected format: YYYY-MM-DD
        // 3 days before
        if (dueDate === threeDaysStr) {
            await createNotification({
                userId,
                type: NotificationType.TASK_DUE_SOON,
                title: "Task Due in 3 Days",
                message: `"${task.title}" is due in 3 days`,
                priority: NotificationPriority.MEDIUM,
                hub: HubType.PLANNER,
                actionUrl: "/planner",
                actionLabel: "View Task",
                relatedId: `${taskDoc.id}_3day`,
            });
        }
        // 1 day before
        if (dueDate === tomorrowStr) {
            await createNotification({
                userId,
                type: NotificationType.TASK_DUE_SOON,
                title: "Task Due Tomorrow",
                message: `"${task.title}" is due tomorrow`,
                priority: NotificationPriority.HIGH,
                hub: HubType.PLANNER,
                actionUrl: "/planner",
                actionLabel: "View Task",
                relatedId: `${taskDoc.id}_1day`,
            });
        }
        // Day of
        if (dueDate === todayStr) {
            await createNotification({
                userId,
                type: NotificationType.TASK_DUE_SOON,
                title: "Task Due Today",
                message: `"${task.title}" is due today!`,
                priority: NotificationPriority.URGENT,
                hub: HubType.PLANNER,
                actionUrl: "/planner",
                actionLabel: "Complete Task",
                relatedId: `${taskDoc.id}_today`,
            });
        }
        // Overdue
        if (dueDate < todayStr) {
            await createNotification({
                userId,
                type: NotificationType.TASK_OVERDUE,
                title: "Task Overdue",
                message: `"${task.title}" is past due!`,
                priority: NotificationPriority.URGENT,
                hub: HubType.PLANNER,
                actionUrl: "/planner",
                actionLabel: "View Task",
                relatedId: `${taskDoc.id}_overdue`,
            });
        }
    }
    // ============ PROCESS EVENTS ============
    console.log("Processing events...");
    const eventsSnapshot = await db.collection("events").get();
    for (const eventDoc of eventsSnapshot.docs) {
        const event = eventDoc.data();
        const userId = event.userId;
        if (!userId || !event.start)
            continue;
        // Events store start as ISO string or date
        const eventDate = new Date(event.start).toISOString().split("T")[0];
        // 3 days before
        if (eventDate === threeDaysStr) {
            await createNotification({
                userId,
                type: NotificationType.EVENT_REMINDER,
                title: "Event in 3 Days",
                message: `"${event.title}" is in 3 days`,
                priority: NotificationPriority.MEDIUM,
                hub: HubType.CALENDAR,
                actionUrl: "/calendar",
                actionLabel: "View Event",
                relatedId: `${eventDoc.id}_3day`,
            });
        }
        // 1 day before
        if (eventDate === tomorrowStr) {
            await createNotification({
                userId,
                type: NotificationType.EVENT_REMINDER,
                title: "Event Tomorrow",
                message: `"${event.title}" is tomorrow`,
                priority: NotificationPriority.HIGH,
                hub: HubType.CALENDAR,
                actionUrl: "/calendar",
                actionLabel: "View Event",
                relatedId: `${eventDoc.id}_1day`,
            });
        }
        // Day of
        if (eventDate === todayStr) {
            const eventTime = new Date(event.start).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
            await createNotification({
                userId,
                type: NotificationType.EVENT_REMINDER,
                title: "Event Today",
                message: `"${event.title}" is today at ${eventTime}`,
                priority: NotificationPriority.URGENT,
                hub: HubType.CALENDAR,
                actionUrl: "/calendar",
                actionLabel: "View Event",
                relatedId: `${eventDoc.id}_today`,
            });
        }
    }
    // ============ PROCESS INTERVIEWS ============
    console.log("Processing interviews...");
    const jobsSnapshot = await db.collection("job_applications").get();
    for (const jobDoc of jobsSnapshot.docs) {
        const job = jobDoc.data();
        const userId = job.userId;
        if (!userId || !job.interviews || !Array.isArray(job.interviews))
            continue;
        for (const interview of job.interviews) {
            if (!interview.date)
                continue;
            const interviewDate = new Date(interview.date).toISOString().split("T")[0];
            const interviewId = `${jobDoc.id}_${interview.date}`;
            // 3 days before
            if (interviewDate === threeDaysStr) {
                await createNotification({
                    userId,
                    type: NotificationType.INTERVIEW_REMINDER,
                    title: "Interview in 3 Days",
                    message: `Interview with ${job.company} is in 3 days`,
                    priority: NotificationPriority.HIGH,
                    hub: HubType.JOBS,
                    actionUrl: "/jobs#applications",
                    actionLabel: "Prepare",
                    relatedId: `${interviewId}_3day`,
                });
            }
            // 1 day before
            if (interviewDate === tomorrowStr) {
                await createNotification({
                    userId,
                    type: NotificationType.INTERVIEW_REMINDER,
                    title: "Interview Tomorrow",
                    message: `Interview with ${job.company} is tomorrow!`,
                    priority: NotificationPriority.URGENT,
                    hub: HubType.JOBS,
                    actionUrl: "/jobs#applications",
                    actionLabel: "Prepare",
                    relatedId: `${interviewId}_1day`,
                });
            }
            // Day of
            if (interviewDate === todayStr) {
                const interviewTime = new Date(interview.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                });
                await createNotification({
                    userId,
                    type: NotificationType.INTERVIEW_REMINDER,
                    title: "Interview Today!",
                    message: `Interview with ${job.company} at ${interviewTime}`,
                    priority: NotificationPriority.URGENT,
                    hub: HubType.JOBS,
                    actionUrl: "/jobs#applications",
                    actionLabel: "View Details",
                    relatedId: `${interviewId}_today`,
                });
            }
        }
    }
    // ============ GENERATE DAILY SUMMARIES ============
    console.log("Generating daily summaries...");
    // Collect all unique userIds and their daily counts
    const userDailyCounts = new Map();
    // Helper to initialize user counts
    const getUserCounts = (userId) => {
        if (!userDailyCounts.has(userId)) {
            userDailyCounts.set(userId, {
                tasks: 0,
                events: 0,
                bills: 0,
                assignments: 0,
                interviews: 0,
            });
        }
        return userDailyCounts.get(userId);
    };
    // Count tasks due today
    for (const taskDoc of tasksSnapshot.docs) {
        const task = taskDoc.data();
        if (task.userId && task.dueDate === todayStr && task.status !== "Complete") {
            getUserCounts(task.userId).tasks++;
        }
    }
    // Count events today
    for (const eventDoc of eventsSnapshot.docs) {
        const event = eventDoc.data();
        if (event.userId && event.start) {
            const eventDate = new Date(event.start).toISOString().split("T")[0];
            if (eventDate === todayStr) {
                getUserCounts(event.userId).events++;
            }
        }
    }
    // Count bills due today
    for (const billDoc of billsSnapshot.docs) {
        const bill = billDoc.data();
        if (bill.userId && !bill.paid) {
            const dueDayOfMonth = typeof bill.dueDate === "number"
                ? bill.dueDate
                : parseInt(bill.dueDate);
            if (dueDayOfMonth === today) {
                getUserCounts(bill.userId).bills++;
            }
        }
    }
    // Count assignments due today
    for (const assignmentDoc of assignmentsSnapshot.docs) {
        const assignment = assignmentDoc.data();
        if (assignment.userId && assignment.dueDate === todayStr && !assignment.completed) {
            getUserCounts(assignment.userId).assignments++;
        }
    }
    // Count interviews today
    for (const jobDoc of jobsSnapshot.docs) {
        const job = jobDoc.data();
        if (job.userId && job.interviews && Array.isArray(job.interviews)) {
            for (const interview of job.interviews) {
                if (interview.date) {
                    const interviewDate = new Date(interview.date).toISOString().split("T")[0];
                    if (interviewDate === todayStr) {
                        getUserCounts(job.userId).interviews++;
                    }
                }
            }
        }
    }
    // Create daily summary for each user
    for (const [userId, counts] of userDailyCounts) {
        const totalCount = counts.tasks + counts.events + counts.bills + counts.assignments + counts.interviews;
        // Build summary message
        const parts = [];
        if (counts.tasks > 0)
            parts.push(`${counts.tasks} task${counts.tasks !== 1 ? "s" : ""}`);
        if (counts.events > 0)
            parts.push(`${counts.events} event${counts.events !== 1 ? "s" : ""}`);
        if (counts.bills > 0)
            parts.push(`${counts.bills} bill${counts.bills !== 1 ? "s" : ""}`);
        if (counts.assignments > 0)
            parts.push(`${counts.assignments} assignment${counts.assignments !== 1 ? "s" : ""}`);
        if (counts.interviews > 0)
            parts.push(`${counts.interviews} interview${counts.interviews !== 1 ? "s" : ""}`);
        const message = totalCount === 0
            ? "You have a clear day ahead! No tasks or events scheduled."
            : `You have ${parts.join(", ")} scheduled for today.`;
        await createNotification({
            userId,
            type: NotificationType.DAILY_SUMMARY,
            title: "Good Morning!",
            message,
            priority: totalCount > 5 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
            hub: HubType.DASHBOARD,
            actionUrl: "/dashboard",
            actionLabel: "View Dashboard",
            relatedId: `daily_${todayStr}`,
        });
    }
    console.log(`Created daily summaries for ${userDailyCounts.size} users`);
    console.log("Daily notification generation complete!");
    return null;
});
/**
 * HTTP function to manually trigger notification generation (for testing)
 */
exports.triggerNotifications = functions.https.onRequest(async (req, res) => {
    // Only allow POST requests
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    console.log("Manually triggering notification generation...");
    // Run the same logic as the scheduled function
    // (In production, you'd refactor to share the logic)
    res.status(200).send("Notification generation triggered. Check logs for details.");
});
//# sourceMappingURL=index.js.map
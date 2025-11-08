// backend/src/jobs/syncReports.js
import cron from "node-cron";
import { pbAdmin } from "../pbAdminClient.js";

export function startReportJob() {
  // every night at 02:00
  cron.schedule("0 2 * * *", async () => {
    try {
      console.log("Running nightly report job...");
      const classes = await pbAdmin.collection("classes").getFullList();

      for (const c of classes) {
        // compute stats quickly (similar to previous)
        const enrollments = await pbAdmin.collection("enrollments").getFullList({ filter: `class = "${c.id}"` });
        const assignments = await pbAdmin.collection("assignments").getFullList({ filter: `class = "${c.id}"` });
        const data = { class: c.id, total_students: enrollments.length, total_assignments: assignments.length, computed_at: new Date().toISOString() };

        // upsert into report_summaries (assume unique on class)
        const exists = await pbAdmin.collection("report_summaries").getFirstListItem(`class = "${c.id}"`).catch(()=>null);
        if (exists) await pbAdmin.collection("report_summaries").update(exists.id, data);
        else await pbAdmin.collection("report_summaries").create(data);
      }
      console.log("Nightly reports done");
    } catch (err) {
      console.error("report job error", err);
    }
  });
}
import { startOfWeek, getWeek, getYear } from "date-fns";
import { storage } from "./storage";
import type { InsertTask, InsertBathroomAssignment } from "@shared/schema";

// Rotation sequences for main cleaning tasks
const ROTATION_SEQUENCES = {
  trash: ["Perpetua", "Eman", "Allegra"],
  sweeping: ["Atilla", "Dania", "Illy", "Eman"],
  dusting: ["Illy", "Allegra", "Atilla", "Perpetua"],
};

// Default bathroom rotation sequences
const BATHROOM_ROTATIONS = {
  1: ["Eman", "Allegra"],
  2: ["Perpetua", "Dania"],
  3: ["Atilla", "Illy"],
};

export class RosterRotationManager {
  /**
   * Get the start of the current week (Monday)
   */
  getCurrentWeekStart(): Date {
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  }

  /**
   * Initialize or get the current week's roster
   */
  async ensureCurrentWeekRoster() {
    const weekStart = this.getCurrentWeekStart();
    let roster = await storage.getCurrentWeekRoster(weekStart);

    if (!roster) {
      // Create new roster for this week
      const weekNumber = getWeek(weekStart, { weekStartsOn: 1 });
      const year = getYear(weekStart);

      roster = await storage.createWeeklyRoster({
        weekStartDate: weekStart,
        weekNumber,
        year,
      });

      // Get the previous week's roster to determine rotation indices
      const allRosters = await storage.getAllWeeklyRosters();
      const previousRoster = allRosters.find(r => r.id !== roster!.id);

      // Create tasks for this week
      await this.createTasksForWeek(roster.id, previousRoster?.id);

      // Create bathroom assignments for this week
      await this.createBathroomAssignmentsForWeek(roster.id, previousRoster?.id);
    }

    return roster;
  }

  /**
   * Create tasks for a new week based on rotation
   */
  private async createTasksForWeek(rosterId: string, previousRosterId?: string) {
    let trashIndex = 0;
    let sweepingIndex = 0;
    let dustingIndex = 0;

    // If there's a previous week, get the rotation indices
    if (previousRosterId) {
      const previousTasks = await storage.getTasksForRoster(previousRosterId);
      const trashTask = previousTasks.find(t => t.name === "Take Out Trash & Replace Bag");
      const sweepTask = previousTasks.find(t => t.name === "Sweep/Vacuum & Mop Floors");
      const dustTask = previousTasks.find(t => t.name === "Dust & Wipe Surfaces");

      if (trashTask?.rotationIndex !== null && trashTask?.rotationIndex !== undefined) {
        trashIndex = (trashTask.rotationIndex + 1) % ROTATION_SEQUENCES.trash.length;
      }
      if (sweepTask?.rotationIndex !== null && sweepTask?.rotationIndex !== undefined) {
        sweepingIndex = (sweepTask.rotationIndex + 1) % ROTATION_SEQUENCES.sweeping.length;
      }
      if (dustTask?.rotationIndex !== null && dustTask?.rotationIndex !== undefined) {
        dustingIndex = (dustTask.rotationIndex + 1) % ROTATION_SEQUENCES.dusting.length;
      }
    }

    // Create the three main tasks
    const mainTasks: InsertTask[] = [
      {
        rosterId,
        name: "Take Out Trash & Replace Bag",
        assignedTo: ROTATION_SEQUENCES.trash[trashIndex],
        isCustomTask: false,
        rotationIndex: trashIndex,
      },
      {
        rosterId,
        name: "Sweep/Vacuum & Mop Floors",
        assignedTo: ROTATION_SEQUENCES.sweeping[sweepingIndex],
        isCustomTask: false,
        rotationIndex: sweepingIndex,
      },
      {
        rosterId,
        name: "Dust & Wipe Surfaces",
        assignedTo: ROTATION_SEQUENCES.dusting[dustingIndex],
        isCustomTask: false,
        rotationIndex: dustingIndex,
      },
    ];

    for (const task of mainTasks) {
      await storage.createTask(task);
    }
  }

  /**
   * Create bathroom assignments for a new week
   */
  private async createBathroomAssignmentsForWeek(rosterId: string, previousRosterId?: string) {
    const assignments: InsertBathroomAssignment[] = [];

    for (let bathroomNum = 1; bathroomNum <= 3; bathroomNum++) {
      let rotationIndex = 0;
      let cleaningMode: "basic" | "deep" = "deep";

      // If there's a previous week, rotate the assignment and alternate cleaning mode
      if (previousRosterId) {
        const previousAssignments = await storage.getBathroomAssignmentsForRoster(previousRosterId);
        const previousAssignment = previousAssignments.find(
          a => a.bathroomNumber === bathroomNum
        );

        if (previousAssignment?.rotationIndex !== null && previousAssignment?.rotationIndex !== undefined) {
          const rotation = BATHROOM_ROTATIONS[bathroomNum as keyof typeof BATHROOM_ROTATIONS];
          rotationIndex = (previousAssignment.rotationIndex + 1) % rotation.length;

          // Alternate cleaning mode
          cleaningMode = previousAssignment.cleaningMode === "deep" ? "basic" : "deep";
        }
      }

      const rotation = BATHROOM_ROTATIONS[bathroomNum as keyof typeof BATHROOM_ROTATIONS];
      assignments.push({
        rosterId,
        bathroomNumber: bathroomNum,
        assignedTo: rotation[rotationIndex],
        cleaningMode,
        rotationIndex,
      });
    }

    for (const assignment of assignments) {
      await storage.createBathroomAssignment(assignment);
    }
  }

  /**
   * Get the full roster data for a specific week
   */
  async getRosterData(rosterId: string) {
    const tasks = await storage.getTasksForRoster(rosterId);
    const bathrooms = await storage.getBathroomAssignmentsForRoster(rosterId);
    const completions = await storage.getAllCompletions();

    // Combine tasks with their completion data
    const tasksWithStatus = await Promise.all(
      tasks.map(async task => {
        const completion = completions.find(c => c.taskId === task.id);
        return {
          id: task.id,
          name: task.name,
          assignedTo: task.assignedTo,
          isCustomTask: task.isCustomTask,
          status: completion ? "completed" : "pending",
          completedAt: completion?.completedAt,
          proofCount: completion?.proofPhotos?.length || 0,
          proofPhotos: completion?.proofPhotos || [],
        };
      })
    );

    return {
      tasks: tasksWithStatus,
      bathrooms: bathrooms.map(b => ({
        id: b.id,
        bathroomNumber: b.bathroomNumber,
        assignedTo: b.assignedTo,
        cleaningMode: b.cleaningMode,
      })),
    };
  }
}

export const rotationManager = new RosterRotationManager();

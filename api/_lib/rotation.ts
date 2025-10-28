import { storage } from "./storage";
import { getWeek, getYear, startOfWeek, format } from "date-fns";

export const ALL_RESIDENTS = ["Perpetua", "Eman", "Allegra", "Atilla", "Dania", "Illy"];

// Predefined rotation sequences for each task type
const TRASH_ROTATION = ["Eman", "Perpetua", "Allegra", "Atilla", "Dania", "Illy"];
const SWEEPING_ROTATION = ["Allegra", "Atilla", "Dania", "Illy", "Eman", "Perpetua"];
const DUSTING_ROTATION = ["Atilla", "Dania", "Illy", "Eman", "Perpetua", "Allegra"];

const BATHROOM_ROTATIONS = {
  1: ["Perpetua", "Eman", "Allegra", "Atilla", "Dania", "Illy"],
  2: ["Eman", "Allegra", "Atilla", "Dania", "Illy", "Perpetua"],
  3: ["Allegra", "Atilla", "Dania", "Illy", "Perpetua", "Eman"],
};

class RosterRotationManager {
  getCurrentWeekInfo() {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    return {
      weekNumber: getWeek(now, { weekStartsOn: 1 }),
      year: getYear(now),
      weekStartDate: format(weekStart, "yyyy-MM-dd"),
    };
  }

  async ensureCurrentWeekRoster() {
    const { weekNumber, year, weekStartDate } = this.getCurrentWeekInfo();

    let roster = await storage.getWeeklyRoster(weekNumber, year);

    if (!roster) {
      roster = await storage.createWeeklyRoster({
        weekNumber,
        year,
        weekStartDate: new Date(weekStartDate),
      });

      await this.createDefaultTasks(roster.id, weekNumber);
      await this.createDefaultBathroomAssignments(roster.id, weekNumber);
    }

    return roster;
  }

  private getAssignmentForWeek(rotation: string[], weekNumber: number): string {
    const index = (weekNumber - 1) % rotation.length;
    return rotation[index];
  }

  private async createDefaultTasks(rosterId: string, weekNumber: number) {
    const tasks = [
      { name: "Take out trash & recycling", rotation: TRASH_ROTATION, rotationIndex: 0 },
      { name: "Sweep common areas", rotation: SWEEPING_ROTATION, rotationIndex: 1 },
      { name: "Dust surfaces", rotation: DUSTING_ROTATION, rotationIndex: 2 },
    ];

    for (const task of tasks) {
      const assignedTo = this.getAssignmentForWeek(task.rotation, weekNumber);
      await storage.createTask({
        rosterId,
        name: task.name,
        assignedTo,
        rotationIndex: task.rotationIndex,
      });
    }
  }

  private async createDefaultBathroomAssignments(rosterId: string, weekNumber: number) {
    for (const [bathroomNum, rotation] of Object.entries(BATHROOM_ROTATIONS)) {
      const assignedTo = this.getAssignmentForWeek(rotation, weekNumber);
      await storage.createBathroomAssignment({
        rosterId,
        bathroomNumber: parseInt(bathroomNum),
        assignedTo,
        cleaningMode: "basic",
      });
    }
  }

  async getRosterData(rosterId: string) {
    const tasks = await storage.getTasksByRosterId(rosterId);
    const bathrooms = await storage.getBathroomsByRosterId(rosterId);

    const tasksWithCompletions = await Promise.all(
      tasks.map(async (task) => {
        const completion = await storage.getCompletionByTaskId(task.id);
        return {
          ...task,
          completedAt: completion?.completedAt || null,
        };
      })
    );

    return {
      tasks: tasksWithCompletions,
      bathrooms,
    };
  }
}

export const rotationManager = new RosterRotationManager();

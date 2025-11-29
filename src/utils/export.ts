import { PlanState } from '../types';

/**
 * Formats a plan as Markdown for download/export
 * @param plan - The plan to format
 * @param progress - Current progress percentage
 * @returns Formatted markdown string
 */
export const formatPlanAsMarkdown = (plan: PlanState, progress: number): string => {
  let content = `# ${plan.planTitle}\n\n`;
  content += `**Overview**: ${plan.overview}\n\n`;
  content += `**Total Progress**: ${progress}%\n\n`;
  content += `---\n\n`;

  const formatTasksRecursive = (tasks: PlanState['days'][0]['tasks'], indent = 0) => {
    let taskContent = '';
    tasks.forEach(task => {
      const checkbox = task.isCompleted ? '[x]' : '[ ]';
      const spaces = '  '.repeat(indent);
      taskContent += `${spaces}- ${checkbox} ${task.description}\n`;
      if (task.videoLink) {
        taskContent += `${spaces}  - Tutorial: ${task.videoLink}\n`;
      }
      if (task.subTasks) {
        taskContent += formatTasksRecursive(task.subTasks, indent + 1);
      }
    });
    return taskContent;
  };

  plan.days.forEach(day => {
    content += `## Day ${day.dayNumber}: ${day.dayLabel}\n`;
    content += `**Focus**: ${day.theme}\n\n`;
    content += formatTasksRecursive(day.tasks);
    content += `\n---\n\n`;
  });

  return content;
};

/**
 * Downloads content as a file
 * @param content - File content
 * @param filename - Name of the file
 * @param mimeType - MIME type of the file
 */
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain'): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

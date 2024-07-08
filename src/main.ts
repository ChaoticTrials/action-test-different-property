import * as core from '@actions/core';
import * as github from '@actions/github';
import { exec } from '@actions/exec';
import * as fs from 'fs';
import * as process from 'node:process';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const settings: ActionSettings = {
      gradleProperty: core.getInput('gradle-property'),
      gradleValue: core.getInput('gradle-value'),
      gradleTask: core.getInput('gradle-task') || 'build',
      githubToken:
        core.getInput('github-token') ?? process.env['GITHUB_TOKEN']!,
      propertiesFile: core.getInput('properties-file'),
      issueTitle: core.getInput('issue-title'),
      issueComment: core.getMultilineInput('issue-comment').join('\n'),
      issueLabels: core.getInput('issue-labels')
    };

    // Modify properties
    const propertiesMap: Map<string, string> = readProperties(
      settings.propertiesFile
    );
    propertiesMap.set(settings.gradleProperty, settings.gradleValue);
    writeProperties(settings.propertiesFile, propertiesMap);
    core.info(
      `Set "${settings.gradleProperty}=${settings.gradleValue}" in ${settings.propertiesFile}`
    );

    // Execute task
    try {
      await exec(`chmod +x gradlew && ./gradlew ${settings.gradleTask}`);
      core.info(`Gradle task ${settings.gradleTask} completed successfully`);
    } catch (error) {
      core.setFailed(`Gradle task '${settings.gradleTask}' failed`);

      // Create an issue if the task fails
      const octokit = github.getOctokit(settings.githubToken);
      const { owner, repo } = github.context.repo;
      await octokit.rest.issues.create({
        owner,
        repo,
        title: settings.issueTitle,
        body: settings.issueComment,
        labels: settings.issueLabels.split(',').map(s => s.trim())
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

function readProperties(propertiesFile: string): Map<string, string> {
  let properties = '';
  if (fs.existsSync(propertiesFile)) {
    properties = fs.readFileSync(propertiesFile, 'utf8');
  }

  // Create a map of properties to handle replacement
  const propertiesMap = new Map<string, string>();
  properties.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      propertiesMap.set(key.trim(), value.trim());
    }
  });

  return propertiesMap;
}

function writeProperties(
  propertiesFile: string,
  propertiesMap: Map<string, string>
): void {
  const updatedProperties = Array.from(propertiesMap)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Write the updated properties back to the file
  fs.writeFileSync(propertiesFile, updatedProperties);
}

interface ActionSettings {
  gradleProperty: string;
  gradleValue: string;
  gradleTask: string;
  githubToken: string;
  propertiesFile: string;
  issueTitle: string;
  issueComment: string;
  issueLabels: string;
}

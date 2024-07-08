# action-test-different-property

An action for testing a codebase with different properties.

## Usage

This GitHub Action modifies a specified property in a Gradle properties file,
runs a Gradle task, and creates an issue if the task fails.

### Inputs

|       Name        |                    Description                     | Required |          Default          |
| :---------------: | :------------------------------------------------: | :------: | :-----------------------: |
| `gradle-property` |           The Gradle property to modify            |   Yes    |                           |
|  `gradle-value`   |      The value to set for the Gradle property      |   Yes    |                           |
|   `gradle-task`   |               The Gradle task to run               |    No    |          `build`          |
|  `github-token`   |         GitHub token for creating an issue         |    No    | `${{ env.GITHUB_TOKEN }}` |
| `properties-file` | The file where the property should be set/replaced |   Yes    |                           |
|   `issue-title`   |               The title of the issue               |   Yes    |                           |
|  `issue-comment`  |  The main body of the issue (supports multiline)   |    No    |                           |
|  `issue-labels`   |          A comma separated list of labels          |    No    |                           |

### Example Workflow

```yaml
name: Run Gradle Task

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      contents: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Set up JDK
        uses: actions/setup-java@v2
        with:
          java-version: '11'

      - name: Run Gradle Task
        uses: your-username/your-repo@main
        with:
          gradle-property: 'my.property'
          gradle-value: 'myValue'
          gradle-task: 'myTask'
          github-token: ${{ secrets.GITHUB_TOKEN }}
          properties-file: 'gradle.properties'
          issue-title: 'Gradle task failed'
          issue-comment: |
            The Gradle task ${{ inputs.gradle-task }} failed. 
            Please check the logs for more details.
          issue-labels: 'bug, gradle'
```

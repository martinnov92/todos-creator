# Todos creator

Use _todos.spec.js_ config file, if you need more control. This file must be placed in root folder.

### Config
```js
module.exports = {
    // is needed if you wish to create issues automatically, or your repository is private
    token: String,
    // is needed if you wish to create issues automatically (only for GitLab)
    projectId: String,
    // where to create issues (default: GitLab, GitHub)
    provider: String,
    // automatically create issue
    createIssue: Boolean,
    // Default: [ '.js' ]
    allowedExtensions: [String],
    // Default: [ 'node_modules', '.git' ]
    ignoreFolders: [String],
    // use only if you use other tracking system (default support: GitLab, GitHub)
    api: {
        // name should be same as 'provider' above
        [String]: {
            // check if issue already exists in your tracking system
            async check() {},
            createIssue () {},
            createIssueLink () {},
        },
    },
};
```

### Example:
```js
function example() {
    // TODO: Finish this function [labels: bug]

    return;
}
```

### Output
```shell
/examples/example.js
Title | TODO: Finish this function
Issue | https://github.com/user/repository/issues/1
```
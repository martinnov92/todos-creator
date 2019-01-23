# Todos creator

This package is for automatic creating of issues. Simply run `create-todos` and from your _`// TODO: has to be done!`_ comment can be created issue on GitHub or GitLab, or you can provide your own methods for issue creation if you use another tracking provider.

There are two options how to set this up:

* create issues automatically, or
* create just a link with pre-filled title (labels will be added later) - this is default


![](https://raw.githubusercontent.com/martinnov92/todos-creator/master/public/todos-creator.gif)

## Config

Use _todos.spec.js_ config file, if you need more control. This file must be placed in root folder.

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
    // TODO: Finish this function

    return;
}
```

### Output example
```shell
/examples/example.js
Title | TODO: Create helper method
Existing issues
     ◉ https://github.com/user/repository/issues/1 (open)

/index.js
Title: TODO: Finish this function
Issue: https://github.com/user/repo/issues/new?title=Finish%20this%20function&labels=
```
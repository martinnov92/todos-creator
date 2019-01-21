const api = require('./api');
const { CWD } = require('./constants');
const { highlight, parseGitRemote, request } = require('./utils');

module.exports = class Issuer {
    constructor ({ config, todos }) {
        this.config = config;

        this.git = parseGitRemote();
        this.provider = this.getRepositaryProvider();

        this.todos = todos;
        this.updatedTodos = [];

        this.api = { ...api, ...config.api };
    }

    async createIssues () {
        if (this.config.createIssue) {
            this.updatedTodos = await this.createIssueInTracker();
        } else {
            this.updatedTodos = await this.createIssueLinkForTracker();
        }

        this.renderResults();
    }

    createIssueInTracker () {
        const { config, git, todos} = this;
        const provider = this.api[this.provider];
        const { issueUrl } = provider.config;

        const promises = todos.map(async (todo = {}) => {
            const existingIssues = await provider.check(todo, config, git);

            if (Boolean(existingIssues.length)) {
                todo.existingIssues = existingIssues;
            } else {
                const { url, options = {}, body = {} } = provider.createIssue(todo, config, git);

                try {
                    const response = await request(url, { method: 'POST', ...options }, body);

                    if (response.message) {
                        throw response;
                    }

                    todo.url = response[issueUrl];
                } catch (exception) {
                    console.log(exception);
                    todo.url = exception.message;
                }
            }

            return todo;
        });

        return Promise.all(promises);
    }

    createIssueLinkForTracker () {
        const { config, git, todos } = this;
        const provider = this.api[this.provider];

        const updatedTodos = todos.map(async (todo) => {
            const existingIssues = await provider.check(todo, config, git);

            if (existingIssues && existingIssues.length) {
                todo.existingIssues = existingIssues;
            } else {
                todo.url = provider.createIssueLink(todo, config, git).url;
            }

            return todo;
        });

        return Promise.all(updatedTodos);
    }

    renderResults () {
        const { updatedTodos } = this;

        for (const todo of updatedTodos) {
            // path === filePath
            const path = todo.path.split(CWD)[1];
    
            console.log(highlight.bold(path));
            console.log(`${highlight.red('Title')}: ${todo.type}: ${todo.title}`);

            if (todo.existingIssues.length) {
                console.log(highlight.red('Similar or existing issues:'));

                for (const { url, state } of todo.existingIssues) {
                    console.log(`       ◉ ${highlight.link(url)} (${state})`);
                }
            } else {
                console.log(`${highlight.red('Issue')}: ${highlight.link(todo.url)}`);
            }

            console.log('\n');
        }
    }

    getRepositaryProvider () {
        return this.config.provider || this.git.provider;
    }
}

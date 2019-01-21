const { encodeParameters, request } = require('./utils');

module.exports = {
    gitlab: {
        config: {
            issueUrl: 'web_url',
        },
        async check (todo, config, git) {
            const { projectId, token } = config;
            const title = encodeURIComponent(todo.title);

            try {
                const headers = {};

                if (typeof config.token === 'string' && config.token.length) {
                    headers['PRIVATE-TOKEN'] = config.token;
                }

                const res = await request(`${git.gitUrl}/api/v4/projects/${projectId}/search?scope=issues&search=${title}`, {
                    method: 'GET',
                    headers,
                });

                return res.map((issue) => {
                    return {
                        state: issue.state,
                        url: issue[this.config.issueUrl],
                    };
                });
            } catch (exception) {
                return [];
            }
        },
        createIssueLink (todo, config, git) {
            let description = '';
            const { title, labels } = encodeParameters(todo);

            if (Boolean(labels.length)) {
                description = `[description]=%2Flabel%20${encodeURIComponent(labels.map((label) => `~${label}`).join(' '))}`;
            }

            return {
                url: `${git.repositoryUrl}/issues/new?issue[title]=${title}&issue[description]=%2Flabel%20${description}`,
            };
        },
        createIssue (todo, config, git) {
            const { projectId } = config;
            const { title, labels } = encodeParameters(todo);

            return {
                url: `${git.gitUrl}/api/v4/projects/${projectId}/issues?title=${title}&labels=${labels.join(',')}`,
                options: {
                    headers: { 'PRIVATE-TOKEN': config.token },
                },
            };
        },
    },
    github: {
        config: {
            issueUrl: 'html_url',
        },
        async check (todo, config, git) {
            const title = encodeURIComponent(todo.title);

            try {
                const headers = { 'User-Agent': 'martinnov92/todos-creator' };

                if (typeof config.token === 'string' && config.token.length) {
                    headers['Authorization'] = `token ${config.token}`;
                }

                const res = await request(`https://api.github.com/search/issues?q=${title}+repo:${git.user}/${git.repo}`, {
                    method: 'GET',
                    headers,
                });

                if (res.items) {
                    return res.items.map((issue) => {
                        return {
                            state: issue.state,
                            url: issue[this.config.issueUrl],
                        };
                    });
                }

                return [];
            } catch (exception) {
                return [];
            }
        },
        createIssueLink (todo, config, git) {
            const { title, labels } = encodeParameters(todo);

            return {
                url: `${git.repositoryUrl}/issues/new?title=${title}&labels=${labels.join(',')}`,
            };
        },
        createIssue (todo, config, git) {
            const { title, labels } = todo;

            return {
                url: `https://api.github.com/repos/${git.user}/${git.repo}/issues`,
                body: {
                    title,
                    labels,
                },
                options: {
                    headers: {
                        'Authorization': `token ${config.token}`,
                        'User-Agent': 'martinnov92/todos-creator',
                    },
                },
            };
        },
    }
};

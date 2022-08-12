import { axios } from "@pipedream/platform";

export default {
  type: "app",
  app: "zenkit",
  propDefinitions: {
    workspace: {
      type: "string",
      label: "Workspace",
      description: "Filter by workspace",
      async options() {
        const workspaces = await this.listWorkspaces();
        if (!workspaces || workspaces?.length === 0) {
          return [];
        }
        return workspaces.map((workspace) => ({
          value: workspace.id,
          label: workspace.name,
        }));
      },
    },
    list: {
      type: "string",
      label: "List",
      description: "Filter by list",
      async options({ workspaceId }) {
        const lists = await this.listLists({
          workspaceId,
        });
        if (!lists || lists?.length === 0) {
          return [];
        }
        return lists.map((list) => ({
          value: list.shortId,
          label: list.name,
        }));
      },
    },
  },
  methods: {
    _baseUrl() {
      return "https://zenkit.com/api/v1/";
    },
    _getHeaders() {
      return {
        Authorization: `Bearer ${this.$auth.oauth_access_token}`,
      };
    },
    async _makeRequest(args = {}) {
      const {
        $ = this,
        method = "GET",
        path,
        ...otherArgs
      } = args;
      const config = {
        method,
        url: `${this._baseUrl()}${path}`,
        headers: this._getHeaders(),
        ...otherArgs,
      };
      return axios($, config);
    },
    async createWebhook(args = {}) {
      return this._makeRequest({
        method: "POST",
        path: "webhooks",
        ...args,
      });
    },
    async deleteWebhook(id) {
      return this._makeRequest({
        method: "DELETE",
        path: `webhooks/${id}`,
      });
    },
    async listWorkspaces(args = {}) {
      return this._makeRequest({
        path: "users/me/workspacesWithLists",
        ...args,
      });
    },
    async listLists({
      workspaceId, ...args
    }) {
      const workspaces = await this.listWorkspaces({
        ...args,
      });
      const workspace = workspaces.find((workspace) => workspace.id == workspaceId);
      return workspace?.lists;
    },
    async listWorkspaceActivities({
      workspaceId, ...args
    }) {
      const { activities } = await this._makeRequest({
        path: `workspaces/${workspaceId}/activities`,
        ...args,
      });
      return activities;
    },
    async listListActivities({
      listId, ...args
    }) {
      const { activities } = await this._makeRequest({
        path: `lists/${listId}/activities`,
        ...args,
      });
      return activities;
    },
    async listNotifications(args = {}) {
      const { notifications } = await this._makeRequest({
        path: "users/me/notifications",
        ...args,
      });
      return notifications;
    },
    async listListEntries({
      listId, ...args
    }) {
      const { listEntries } = await this._makeRequest({
        method: "POST",
        path: `lists/${listId}/entries/filter/list`,
        ...args,
      });
      return listEntries;
    },
  },
};

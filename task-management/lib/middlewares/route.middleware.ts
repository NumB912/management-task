import { checkOwner } from "./checkOwner.middleware";
import { checkOwnerTag } from "./checkOwnerTag.middleware";
import { checkPermission } from "./checkPermission.middleware";
import { checkPermissionSection } from "./checkPermissionSection.middleware";
import { checkPermissionTask } from "./checkPermissionTask.middleware";
import { Route } from "./types.middleware";
import { verifyToken } from "./verifyToken.middleware";
export const routes: Route[] = [
    { matcher: "/api/workspace", chain: [await verifyToken()] },
    { matcher: "/api/tags", chain: [await verifyToken()] },
    { matcher: "/api/tags/:tagId", chain: [await verifyToken()] },
    { matcher: "/api/tags/:tagId/onlyMe", chain: [await verifyToken(), await checkOwnerTag()] },
    { matcher: "/api/tags/:tagId/withShare", chain: [await verifyToken()] },
    { matcher: "/api/filters", chain: [await verifyToken()] },
    { matcher: "/api/user/me", chain: [await verifyToken()] },
    {
        matcher: "/api/lists", chain: [await verifyToken()]
    },
    { matcher: "/api/lists/allListSection", chain: [await verifyToken()] },
    { matcher: "/api/filters/:filterId", chain: [await verifyToken()] },
    {
        matcher: "/api/lists/:listId", chain: [await verifyToken(), await checkPermission({
            "can edit": ["GET"],
            "read only": ["GET"],
        })]
    },
    {
        matcher: "/api/lists/:listId/sections", chain: [await verifyToken(), await checkPermission({
            "can edit": ["DELETE", "GET", "PATCH", "POST", "PUT"],
            "read only": ["GET"],
        })]
    },
    {
        matcher: "/api/inbox", chain: [await verifyToken()]
    }
    ,
    {
        matcher: "/api/lists/:listId/sections/:sectionId/tasks", chain: [await verifyToken(), await checkPermission({
            "can edit": ["DELETE", "GET", "PATCH", "POST", "PUT"],
            "read only": ["GET"],
        })]
    },
    {
        matcher: "/api/lists/:listId/tasks", chain: [await verifyToken(), await checkPermission({
            "can edit": ["DELETE", "GET", "PATCH", "POST", "PUT"],
            "read only": ["GET"],
        })]
    },
    { matcher: "/api/lists/:listId/members/:memberId", chain: [await verifyToken(), await checkOwner()] },
    { matcher: "/api/lists/:listId/members/:memberId/inviteStatus", chain: [await verifyToken()] },
    { matcher: "/api/lists/:listId/members", chain: [await verifyToken()] },
    { matcher: "/api/auth/register", chain: [await verifyToken("register_token", "x-register")] },
    {
        matcher: "/api/tasks/today", chain: [await verifyToken()]
    },
    {
        matcher: "/api/tasks/upComming", chain: [await verifyToken()]
    },
    {
        matcher: "/api/tasks/:taskId", chain: [await verifyToken(), await checkPermissionTask({
            "can edit": ["DELETE", "GET", "PATCH", "POST", "PUT"],
            "read only": ["GET"],
        })]
    },
    {
        matcher: "/api/tasks/:taskId/rule", chain: [await verifyToken(), await checkPermissionTask({
            "can edit": ["DELETE", "GET", "PATCH", "POST", "PUT"],
            "read only": ["GET"],
        })]
    }
    ,
    {
        matcher: "/api/tasks/:taskId/status", chain: [await verifyToken(), await checkPermissionTask({
            "can edit": ["DELETE", "GET", "PATCH", "POST", "PUT"],
            "read only": ["GET"],
        })]
    },
    {
        matcher: "/api/sections/:sectionId", chain: [await verifyToken(), await checkPermissionSection({
            "can edit": ["DELETE", "GET", "PATCH", "POST", "PUT"],
            "read only": ["GET"],
        })]
    },
]
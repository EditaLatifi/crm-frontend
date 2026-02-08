module.exports = [
"[project]/frontend/components/tables/TasksTable.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TasksTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$box$2f$box$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/box/box.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$flex$2f$flex$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/flex/flex.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$typography$2f$heading$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/typography/heading.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$stack$2f$v$2d$stack$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/stack/v-stack.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$typography$2f$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/typography/text.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$tag$2f$tag$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/tag/tag.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$avatar$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/avatar/avatar.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$spinner$2f$spinner$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/spinner/spinner.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const statusColumns = [
    {
        key: 'OPEN',
        label: 'To Do',
        color: 'gray'
    },
    {
        key: 'IN_PROGRESS',
        label: 'In Progress',
        color: 'blue'
    },
    {
        key: 'DONE',
        label: 'Done',
        color: 'green'
    }
];
function TasksTable() {
    const [tasks, setTasks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetch('/api/tasks').then((res)=>res.json()).then((data)=>{
            // Ensure tasks is always an array
            if (Array.isArray(data)) {
                setTasks(data);
            } else if (data && Array.isArray(data.tasks)) {
                setTasks(data.tasks);
            } else {
                setTasks([]);
            }
            setLoading(false);
        });
    }, []);
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$flex$2f$flex$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Flex"], {
        justify: "center",
        align: "center",
        minH: "200px",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$spinner$2f$spinner$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Spinner"], {
            size: "lg"
        }, void 0, false, {
            fileName: "[project]/frontend/components/tables/TasksTable.tsx",
            lineNumber: 33,
            columnNumber: 74
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/components/tables/TasksTable.tsx",
        lineNumber: 33,
        columnNumber: 23
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$flex$2f$flex$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Flex"], {
        gap: 6,
        overflowX: {
            base: 'auto',
            md: 'visible'
        },
        py: 4,
        children: statusColumns.map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$box$2f$box$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Box"], {
                bg: "#f7f8fa",
                borderRadius: "lg",
                minW: "320px",
                p: 4,
                boxShadow: "md",
                flex: 1,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$typography$2f$heading$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Heading"], {
                        size: "md",
                        mb: 4,
                        color: col.color + '.600',
                        children: col.label
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/tables/TasksTable.tsx",
                        lineNumber: 39,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$stack$2f$v$2d$stack$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VStack"], {
                        align: "stretch",
                        spacing: 4,
                        minH: "80px",
                        children: [
                            tasks.filter((t)=>t.status === col.key).length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$typography$2f$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Text"], {
                                color: "gray.400",
                                fontSize: "sm",
                                children: "No tasks"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/tables/TasksTable.tsx",
                                lineNumber: 42,
                                columnNumber: 15
                            }, this),
                            tasks.filter((t)=>t.status === col.key).map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: `/tasks/${t.id}`,
                                    style: {
                                        textDecoration: 'none'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$box$2f$box$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Box"], {
                                        bg: "#fff",
                                        borderRadius: "md",
                                        p: 4,
                                        boxShadow: "sm",
                                        _hover: {
                                            boxShadow: 'lg',
                                            bg: '#f0f4ff'
                                        },
                                        transition: "all 0.2s",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$flex$2f$flex$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Flex"], {
                                                align: "center",
                                                justify: "space-between",
                                                mb: 2,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$typography$2f$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Text"], {
                                                        fontWeight: "bold",
                                                        fontSize: "md",
                                                        children: t.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/tables/TasksTable.tsx",
                                                        lineNumber: 48,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$tag$2f$tag$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tag"], {
                                                        colorScheme: col.color,
                                                        size: "sm",
                                                        children: t.priority
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/tables/TasksTable.tsx",
                                                        lineNumber: 49,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/components/tables/TasksTable.tsx",
                                                lineNumber: 47,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$flex$2f$flex$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Flex"], {
                                                align: "center",
                                                gap: 2,
                                                fontSize: "sm",
                                                color: "gray.600",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$avatar$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Avatar"], {
                                                        size: "xs",
                                                        name: t.assigneeName || t.assignedToUserId || 'Unassigned'
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/tables/TasksTable.tsx",
                                                        lineNumber: 52,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$typography$2f$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Text"], {
                                                        children: t.assigneeName || t.assignedToUserId || 'Unassigned'
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/tables/TasksTable.tsx",
                                                        lineNumber: 53,
                                                        columnNumber: 21
                                                    }, this),
                                                    t.dueDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$typography$2f$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Text"], {
                                                        ml: 2,
                                                        children: [
                                                            "Due: ",
                                                            new Date(t.dueDate).toLocaleDateString()
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/components/tables/TasksTable.tsx",
                                                        lineNumber: 54,
                                                        columnNumber: 35
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/components/tables/TasksTable.tsx",
                                                lineNumber: 51,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/tables/TasksTable.tsx",
                                        lineNumber: 46,
                                        columnNumber: 17
                                    }, this)
                                }, t.id, false, {
                                    fileName: "[project]/frontend/components/tables/TasksTable.tsx",
                                    lineNumber: 45,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/tables/TasksTable.tsx",
                        lineNumber: 40,
                        columnNumber: 11
                    }, this)
                ]
            }, col.key, true, {
                fileName: "[project]/frontend/components/tables/TasksTable.tsx",
                lineNumber: 38,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/frontend/components/tables/TasksTable.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
}),
"[project]/frontend/node_modules/@chakra-ui/react/dist/esm/typography/heading.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Heading",
    ()=>Heading
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$styled$2d$system$2f$dist$2f$esm$2f$theming$2d$props$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/node_modules/@chakra-ui/styled-system/dist/esm/theming-props.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$utils$2f$dist$2f$esm$2f$cx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/node_modules/@chakra-ui/utils/dist/esm/cx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$forward$2d$ref$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/system/forward-ref.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$use$2d$style$2d$config$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/system/use-style-config.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/system/factory.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
const Heading = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$forward$2d$ref$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(function Heading2(props, ref) {
    const styles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$use$2d$style$2d$config$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStyleConfig"])("Heading", props);
    const { className, ...rest } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$styled$2d$system$2f$dist$2f$esm$2f$theming$2d$props$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["omitThemingProps"])(props);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["chakra"].h2, {
        ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$utils$2f$dist$2f$esm$2f$cx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cx"])("chakra-heading", props.className),
        ...rest,
        __css: styles
    });
});
Heading.displayName = "Heading";
;
}),
"[project]/frontend/node_modules/@chakra-ui/react/dist/esm/tag/tag.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tag",
    ()=>Tag,
    "TagCloseButton",
    ()=>TagCloseButton,
    "TagLabel",
    ()=>TagLabel,
    "TagLeftIcon",
    ()=>TagLeftIcon,
    "TagRightIcon",
    ()=>TagRightIcon,
    "useTagStyles",
    ()=>useTagStyles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$styled$2d$system$2f$dist$2f$esm$2f$theming$2d$props$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/node_modules/@chakra-ui/styled-system/dist/esm/theming-props.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$utils$2f$dist$2f$esm$2f$context$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/node_modules/@chakra-ui/utils/dist/esm/context.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$icon$2f$icon$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/icon/icon.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$forward$2d$ref$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/system/forward-ref.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$use$2d$style$2d$config$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/system/use-style-config.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/system/factory.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
const [TagStylesProvider, useTagStyles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$utils$2f$dist$2f$esm$2f$context$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    name: `TagStylesContext`,
    errorMessage: `useTagStyles returned is 'undefined'. Seems you forgot to wrap the components in "<Tag />" `
});
const Tag = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$forward$2d$ref$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])((props, ref)=>{
    const styles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$use$2d$style$2d$config$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMultiStyleConfig"])("Tag", props);
    const ownProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$styled$2d$system$2f$dist$2f$esm$2f$theming$2d$props$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["omitThemingProps"])(props);
    const containerStyles = {
        display: "inline-flex",
        verticalAlign: "top",
        alignItems: "center",
        maxWidth: "100%",
        ...styles.container
    };
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(TagStylesProvider, {
        value: styles,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["chakra"].span, {
            ref,
            ...ownProps,
            __css: containerStyles
        })
    });
});
Tag.displayName = "Tag";
const TagLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$forward$2d$ref$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])((props, ref)=>{
    const styles = useTagStyles();
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["chakra"].span, {
        ref,
        noOfLines: 1,
        ...props,
        __css: styles.label
    });
});
TagLabel.displayName = "TagLabel";
const TagLeftIcon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$forward$2d$ref$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])((props, ref)=>/* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$icon$2f$icon$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
        ref,
        verticalAlign: "top",
        marginEnd: "0.5rem",
        ...props
    }));
TagLeftIcon.displayName = "TagLeftIcon";
const TagRightIcon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$forward$2d$ref$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])((props, ref)=>/* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$icon$2f$icon$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
        ref,
        verticalAlign: "top",
        marginStart: "0.5rem",
        ...props
    }));
TagRightIcon.displayName = "TagRightIcon";
const TagCloseIcon = (props)=>/* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$icon$2f$icon$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
        verticalAlign: "inherit",
        viewBox: "0 0 512 512",
        ...props,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
            fill: "currentColor",
            d: "M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z"
        })
    });
TagCloseIcon.displayName = "TagCloseIcon";
const TagCloseButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$forward$2d$ref$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])((props, ref)=>{
    const { isDisabled, children, ...rest } = props;
    const styles = useTagStyles();
    const btnStyles = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        outline: "0",
        ...styles.closeButton
    };
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["chakra"].button, {
        ref,
        "aria-label": "close",
        ...rest,
        type: "button",
        disabled: isDisabled,
        __css: btnStyles,
        children: children || /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(TagCloseIcon, {})
    });
});
TagCloseButton.displayName = "TagCloseButton";
;
}),
"[project]/frontend/node_modules/@chakra-ui/react/node_modules/@chakra-ui/utils/dist/esm/call-all.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "callAll",
    ()=>callAll,
    "callAllHandlers",
    ()=>callAllHandlers
]);
function callAll(...fns) {
    return function mergedFn(...args) {
        fns.forEach((fn)=>fn?.(...args));
    };
}
function callAllHandlers(...fns) {
    return function func(event) {
        fns.some((fn)=>{
            fn?.(event);
            return event?.defaultPrevented;
        });
    };
}
;
}),
"[project]/frontend/node_modules/@chakra-ui/react/dist/esm/avatar/avatar-context.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AvatarStylesProvider",
    ()=>AvatarStylesProvider,
    "useAvatarStyles",
    ()=>useAvatarStyles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$utils$2f$dist$2f$esm$2f$context$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/node_modules/@chakra-ui/utils/dist/esm/context.mjs [app-ssr] (ecmascript)");
'use client';
;
const [AvatarStylesProvider, useAvatarStyles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$utils$2f$dist$2f$esm$2f$context$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    name: `AvatarStylesContext`,
    hookName: `useAvatarStyles`,
    providerName: "<Avatar/>"
});
;
}),
"[project]/frontend/node_modules/@chakra-ui/react/dist/esm/avatar/avatar-name.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AvatarName",
    ()=>AvatarName,
    "initials",
    ()=>initials
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$avatar$2d$context$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/avatar/avatar-context.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/system/factory.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
function initials(name) {
    const names = name.trim().split(" ");
    const firstName = names[0] ?? "";
    const lastName = names.length > 1 ? names[names.length - 1] : "";
    return firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}` : firstName.charAt(0);
}
function AvatarName(props) {
    const { name, getInitials, ...rest } = props;
    const styles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$avatar$2d$context$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAvatarStyles"])();
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["chakra"].div, {
        role: "img",
        "aria-label": name,
        ...rest,
        __css: styles.label,
        children: name ? getInitials?.(name) : null
    });
}
AvatarName.displayName = "AvatarName";
;
}),
"[project]/frontend/node_modules/@chakra-ui/react/dist/esm/avatar/generic-avatar-icon.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GenericAvatarIcon",
    ()=>GenericAvatarIcon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/system/factory.mjs [app-ssr] (ecmascript)");
'use client';
;
;
const GenericAvatarIcon = (props)=>/* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["chakra"].svg, {
        viewBox: "0 0 128 128",
        color: "#fff",
        width: "100%",
        height: "100%",
        className: "chakra-avatar__svg",
        ...props,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
                fill: "currentColor",
                d: "M103,102.1388 C93.094,111.92 79.3504,118 64.1638,118 C48.8056,118 34.9294,111.768 25,101.7892 L25,95.2 C25,86.8096 31.981,80 40.6,80 L87.4,80 C96.019,80 103,86.8096 103,95.2 L103,102.1388 Z"
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
                fill: "currentColor",
                d: "M63.9961647,24 C51.2938136,24 41,34.2938136 41,46.9961647 C41,59.7061864 51.2938136,70 63.9961647,70 C76.6985159,70 87,59.7061864 87,46.9961647 C87,34.2938136 76.6985159,24 63.9961647,24"
            })
        ]
    });
;
}),
"[project]/frontend/node_modules/@chakra-ui/react/dist/esm/image/use-image.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "shouldShowFallbackImage",
    ()=>shouldShowFallbackImage,
    "useImage",
    ()=>useImage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$hooks$2f$dist$2f$esm$2f$use$2d$safe$2d$layout$2d$effect$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/hooks/dist/esm/use-safe-layout-effect.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function useImage(props) {
    const { loading, src, srcSet, onLoad, onError, crossOrigin, sizes, ignoreFallback } = props;
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("pending");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setStatus(src ? "loading" : "pending");
    }, [
        src
    ]);
    const imageRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!src) return;
        flush();
        const img = new Image();
        img.src = src;
        if (crossOrigin) img.crossOrigin = crossOrigin;
        if (srcSet) img.srcset = srcSet;
        if (sizes) img.sizes = sizes;
        if (loading) img.loading = loading;
        img.onload = (event)=>{
            flush();
            setStatus("loaded");
            onLoad?.(event);
        };
        img.onerror = (error)=>{
            flush();
            setStatus("failed");
            onError?.(error);
        };
        imageRef.current = img;
    }, [
        src,
        crossOrigin,
        srcSet,
        sizes,
        onLoad,
        onError,
        loading
    ]);
    const flush = ()=>{
        if (imageRef.current) {
            imageRef.current.onload = null;
            imageRef.current.onerror = null;
            imageRef.current = null;
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$hooks$2f$dist$2f$esm$2f$use$2d$safe$2d$layout$2d$effect$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSafeLayoutEffect"])(()=>{
        if (ignoreFallback) return void 0;
        if (status === "loading") {
            load();
        }
        return ()=>{
            flush();
        };
    }, [
        status,
        load,
        ignoreFallback
    ]);
    return ignoreFallback ? "loaded" : status;
}
const shouldShowFallbackImage = (status, fallbackStrategy)=>status !== "loaded" && fallbackStrategy === "beforeLoadOrError" || status === "failed" && fallbackStrategy === "onError";
;
}),
"[project]/frontend/node_modules/@chakra-ui/react/dist/esm/avatar/avatar-image.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AvatarImage",
    ()=>AvatarImage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$avatar$2d$name$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/avatar/avatar-name.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$generic$2d$avatar$2d$icon$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/avatar/generic-avatar-icon.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$image$2f$use$2d$image$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/image/use-image.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/system/factory.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
function AvatarImage(props) {
    const { src, srcSet, onError, onLoad, getInitials, name, borderRadius, loading, iconLabel, icon = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$generic$2d$avatar$2d$icon$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GenericAvatarIcon"], {}), ignoreFallback, referrerPolicy, crossOrigin } = props;
    const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$image$2f$use$2d$image$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImage"])({
        src,
        onError,
        crossOrigin,
        ignoreFallback
    });
    const hasLoaded = status === "loaded";
    const showFallback = !src || !hasLoaded;
    if (showFallback) {
        return name ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$avatar$2d$name$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AvatarName"], {
            className: "chakra-avatar__initials",
            getInitials,
            name
        }) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneElement"])(icon, {
            role: "img",
            "aria-label": iconLabel
        });
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["chakra"].img, {
        src,
        srcSet,
        alt: name ?? iconLabel,
        onLoad,
        referrerPolicy,
        crossOrigin: crossOrigin ?? void 0,
        className: "chakra-avatar__img",
        loading,
        __css: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius
        }
    });
}
AvatarImage.displayName = "AvatarImage";
;
}),
"[project]/frontend/node_modules/@chakra-ui/react/dist/esm/avatar/avatar.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Avatar",
    ()=>Avatar,
    "baseStyle",
    ()=>baseStyle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$styled$2d$system$2f$dist$2f$esm$2f$define$2d$styles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/node_modules/@chakra-ui/styled-system/dist/esm/define-styles.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$styled$2d$system$2f$dist$2f$esm$2f$theming$2d$props$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/node_modules/@chakra-ui/styled-system/dist/esm/theming-props.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$utils$2f$dist$2f$esm$2f$cx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/node_modules/@chakra-ui/utils/dist/esm/cx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$utils$2f$dist$2f$esm$2f$attr$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/node_modules/@chakra-ui/utils/dist/esm/attr.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$utils$2f$dist$2f$esm$2f$call$2d$all$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/node_modules/@chakra-ui/utils/dist/esm/call-all.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$avatar$2d$context$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/avatar/avatar-context.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$avatar$2d$image$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/avatar/avatar-image.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$avatar$2d$name$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/avatar/avatar-name.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$generic$2d$avatar$2d$icon$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/avatar/generic-avatar-icon.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$forward$2d$ref$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/system/forward-ref.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$use$2d$style$2d$config$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/system/use-style-config.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@chakra-ui/react/dist/esm/system/factory.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
;
;
const baseStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$styled$2d$system$2f$dist$2f$esm$2f$define$2d$styles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defineStyle"])({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: "medium",
    position: "relative",
    flexShrink: 0
});
const Avatar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$forward$2d$ref$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])((props, ref)=>{
    const styles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$use$2d$style$2d$config$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMultiStyleConfig"])("Avatar", props);
    const [isLoaded, setIsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const { src, srcSet, name, showBorder, borderRadius = "full", onError, onLoad: onLoadProp, getInitials = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$avatar$2d$name$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initials"], icon = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$generic$2d$avatar$2d$icon$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GenericAvatarIcon"], {}), iconLabel = " avatar", loading, children, borderColor, ignoreFallback, crossOrigin, referrerPolicy, ...rest } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$styled$2d$system$2f$dist$2f$esm$2f$theming$2d$props$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["omitThemingProps"])(props);
    const avatarStyles = {
        borderRadius,
        borderWidth: showBorder ? "2px" : void 0,
        ...baseStyle,
        ...styles.container
    };
    if (borderColor) {
        avatarStyles.borderColor = borderColor;
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$system$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["chakra"].span, {
        ref,
        ...rest,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$utils$2f$dist$2f$esm$2f$cx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cx"])("chakra-avatar", props.className),
        "data-loaded": (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$utils$2f$dist$2f$esm$2f$attr$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataAttr"])(isLoaded),
        __css: avatarStyles,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$avatar$2d$context$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AvatarStylesProvider"], {
            value: styles,
            children: [
                /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$avatar$2f$avatar$2d$image$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AvatarImage"], {
                    src,
                    srcSet,
                    loading,
                    onLoad: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$node_modules$2f40$chakra$2d$ui$2f$utils$2f$dist$2f$esm$2f$call$2d$all$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callAllHandlers"])(onLoadProp, ()=>{
                        setIsLoaded(true);
                    }),
                    onError,
                    getInitials,
                    name,
                    borderRadius,
                    icon,
                    iconLabel,
                    ignoreFallback,
                    crossOrigin,
                    referrerPolicy
                }),
                children
            ]
        })
    });
});
Avatar.displayName = "Avatar";
;
}),
];

//# sourceMappingURL=frontend_9a552c09._.js.map
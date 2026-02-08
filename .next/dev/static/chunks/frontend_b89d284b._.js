(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/src/auth/tokenStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearAccessToken",
    ()=>clearAccessToken,
    "clearTokenFromStorage",
    ()=>clearTokenFromStorage,
    "getAccessToken",
    ()=>getAccessToken,
    "loadTokenFromStorage",
    ()=>loadTokenFromStorage,
    "saveTokenToStorage",
    ()=>saveTokenToStorage,
    "setAccessToken",
    ()=>setAccessToken
]);
// src/auth/tokenStore.ts
// In-memory access token store (never trust localStorage for security)
let accessToken = null;
function getAccessToken() {
    return accessToken;
}
function setAccessToken(token) {
    accessToken = token;
}
function clearAccessToken() {
    accessToken = null;
}
function loadTokenFromStorage() {
    if ("TURBOPACK compile-time truthy", 1) {
        accessToken = localStorage.getItem('accessToken');
    }
}
function saveTokenToStorage() {
    if (("TURBOPACK compile-time value", "object") !== 'undefined' && accessToken) {
        localStorage.setItem('accessToken', accessToken);
    }
}
function clearTokenFromStorage() {
    if ("TURBOPACK compile-time truthy", 1) {
        localStorage.removeItem('accessToken');
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/api/client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api,
    "getMe",
    ()=>getMe,
    "login",
    ()=>login
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
// src/api/client.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/auth/tokenStore.ts [app-client] (ecmascript)");
;
const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
async function fetchWithAuth(input, init = {}, retry = true) {
    let token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAccessToken"])();
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    let res = await fetch(`${API_BASE_URL}${input}`, {
        ...init,
        headers,
        credentials: 'include'
    });
    if (res.status === 401 && retry) {
        // Try refresh
        const refreshed = await refreshToken();
        if (refreshed) {
            token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAccessToken"])();
            headers.set('Authorization', `Bearer ${token}`);
            res = await fetch(`${API_BASE_URL}${input}`, {
                ...init,
                headers,
                credentials: 'include'
            });
        } else {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearAccessToken"])();
            throw {
                status: 401,
                message: 'Session expired'
            };
        }
    }
    if (!res.ok) {
        let message = 'Unknown error';
        try {
            message = (await res.json()).message || message;
        } catch  {}
        throw {
            status: res.status,
            message
        };
    }
    if (res.status === 204) return null;
    return res.json();
}
async function refreshToken() {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (data.accessToken) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setAccessToken"])(data.accessToken);
            return true;
        }
        return false;
    } catch  {
        return false;
    }
}
const api = {
    get: (url)=>fetchWithAuth(url, {
            method: 'GET'
        }),
    post: (url, body)=>fetchWithAuth(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        }),
    patch: (url, body)=>fetchWithAuth(url, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        }),
    delete: (url)=>fetchWithAuth(url, {
            method: 'DELETE'
        })
};
async function login(email, password) {
    return api.post('/auth/login', {
        email,
        password
    });
}
async function getMe() {
    return api.get('/users/me');
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/auth/AuthProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
// src/auth/AuthProvider.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/api/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/auth/tokenStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [accessToken, setAccessTokenState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAccessToken"])());
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // On mount, try to load token from storage (if fallback is used)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadTokenFromStorage"])();
            const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAccessToken"])();
            if (token) setAccessTokenState(token);
            bootstrapUser();
        // eslint-disable-next-line
        }
    }["AuthProvider.useEffect"], []);
    async function bootstrapUser() {
        setLoading(true);
        setError(null);
        try {
            const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMe"])();
            setUser(me);
        } catch (err) {
            setUser(null);
            if (err.status === 401) (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearAccessToken"])();
        } finally{
            setLoading(false);
        }
    }
    async function login(email, password) {
        setLoading(true);
        setError(null);
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["login"])(email, password);
            if (data.accessToken) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setAccessToken"])(data.accessToken);
                setAccessTokenState(data.accessToken);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveTokenToStorage"])(); // fallback only
            }
            await bootstrapUser();
        } catch (err) {
            setError(err.message || 'Login failed');
            setUser(null);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearAccessToken"])();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearTokenFromStorage"])();
        } finally{
            setLoading(false);
        }
    }
    function logout() {
        setUser(null);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearAccessToken"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$tokenStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearTokenFromStorage"])();
        setAccessTokenState(null);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            role: user?.role || null,
            accessToken,
            login,
            logout,
            loading,
            error
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/src/auth/AuthProvider.tsx",
        lineNumber: 83,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "4+z1NBKrktSNxubrzYZIQ8OXMHE=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
_s1(useAuth, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/charts/TasksBarChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TasksBarChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-chartjs-2/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/chart.js/dist/chart.js [app-client] (ecmascript) <locals>");
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Chart"].register(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CategoryScale"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["LinearScale"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BarElement"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Title"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Tooltip"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Legend"]);
function TasksBarChart({ data }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: '100%',
            height: 300
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Tasks',
                        data: data.values,
                        backgroundColor: '#0052cc'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Tasks Overview'
                    }
                }
            }
        }, void 0, false, {
            fileName: "[project]/frontend/components/charts/TasksBarChart.tsx",
            lineNumber: 8,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/components/charts/TasksBarChart.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = TasksBarChart;
var _c;
__turbopack_context__.k.register(_c, "TasksBarChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/charts/DealsPieChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DealsPieChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-chartjs-2/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/chart.js/dist/chart.js [app-client] (ecmascript) <locals>");
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Chart"].register(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ArcElement"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Tooltip"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Legend"]);
function DealsPieChart({ data }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: '100%',
            height: 300
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Pie"], {
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Deals',
                        data: data.values,
                        backgroundColor: [
                            '#0052cc',
                            '#36a2eb',
                            '#ffce56',
                            '#e74c3c'
                        ]
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Deals by Stage'
                    }
                }
            }
        }, void 0, false, {
            fileName: "[project]/frontend/components/charts/DealsPieChart.tsx",
            lineNumber: 8,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/components/charts/DealsPieChart.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = DealsPieChart;
var _c;
__turbopack_context__.k.register(_c, "DealsPieChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/charts/TimeLineChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TimeLineChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-chartjs-2/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/chart.js/dist/chart.js [app-client] (ecmascript) <locals>");
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Chart"].register(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CategoryScale"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["LinearScale"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PointElement"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["LineElement"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Title"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Tooltip"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Legend"]);
function TimeLineChart({ data }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: '100%',
            height: 300
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Time Tracked (h)',
                        data: data.values,
                        borderColor: '#0052cc',
                        backgroundColor: 'rgba(0,82,204,0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Time Tracking'
                    }
                }
            }
        }, void 0, false, {
            fileName: "[project]/frontend/components/charts/TimeLineChart.tsx",
            lineNumber: 8,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/components/charts/TimeLineChart.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = TimeLineChart;
var _c;
__turbopack_context__.k.register(_c, "TimeLineChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/app/dashboard/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/auth/AuthProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$charts$2f$TasksBarChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/charts/TasksBarChart.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$charts$2f$DealsPieChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/charts/DealsPieChart.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$charts$2f$TimeLineChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/charts/TimeLineChart.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function DashboardPage() {
    _s();
    const { user, loading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [tasksCount, setTasksCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [dealsCount, setDealsCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [timeTracked, setTimeTracked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [recentActivity, setRecentActivity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [tasksChart, setTasksChart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        labels: [],
        values: []
    });
    const [dealsChart, setDealsChart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        labels: [],
        values: []
    });
    const [timeChart, setTimeChart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        labels: [],
        values: []
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardPage.useEffect": ()=>{
            if (!loading && !user) {
                router.replace('/login');
            }
        }
    }["DashboardPage.useEffect"], [
        user,
        loading,
        router
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardPage.useEffect": ()=>{
            if (!user) return;
            // Fetch tasks summary
            fetch('/api/tasks').then({
                "DashboardPage.useEffect": (res)=>res.json()
            }["DashboardPage.useEffect"]).then({
                "DashboardPage.useEffect": (data)=>{
                    if (Array.isArray(data)) {
                        setTasksCount(data.filter({
                            "DashboardPage.useEffect": (t)=>t.status !== 'DONE'
                        }["DashboardPage.useEffect"]).length);
                        // Chart: tasks by status
                        const statusMap = {};
                        data.forEach({
                            "DashboardPage.useEffect": (t)=>{
                                statusMap[t.status] = (statusMap[t.status] || 0) + 1;
                            }
                        }["DashboardPage.useEffect"]);
                        setTasksChart({
                            labels: Object.keys(statusMap),
                            values: Object.values(statusMap)
                        });
                        // Recent activity (tasks)
                        setRecentActivity({
                            "DashboardPage.useEffect": (prev)=>[
                                    ...data.slice(0, 3).map({
                                        "DashboardPage.useEffect": (t)=>`Task "${t.title || t.name || t.id}" status: ${t.status}`
                                    }["DashboardPage.useEffect"]),
                                    ...prev
                                ]
                        }["DashboardPage.useEffect"]);
                    }
                }
            }["DashboardPage.useEffect"]);
            // Fetch deals summary
            fetch('/api/deals').then({
                "DashboardPage.useEffect": (res)=>res.json()
            }["DashboardPage.useEffect"]).then({
                "DashboardPage.useEffect": (data)=>{
                    if (Array.isArray(data)) {
                        setDealsCount(data.length);
                        // Chart: deals by stage
                        const stageMap = {};
                        data.forEach({
                            "DashboardPage.useEffect": (d)=>{
                                stageMap[d.stageId] = (stageMap[d.stageId] || 0) + 1;
                            }
                        }["DashboardPage.useEffect"]);
                        setDealsChart({
                            labels: Object.keys(stageMap),
                            values: Object.values(stageMap)
                        });
                        setRecentActivity({
                            "DashboardPage.useEffect": (prev)=>[
                                    ...data.slice(0, 2).map({
                                        "DashboardPage.useEffect": (d)=>`Deal "${d.name}" stage: ${d.stageId}`
                                    }["DashboardPage.useEffect"]),
                                    ...prev
                                ]
                        }["DashboardPage.useEffect"]);
                    }
                }
            }["DashboardPage.useEffect"]);
            // Fetch time entries summary
            fetch('/api/time-entries').then({
                "DashboardPage.useEffect": (res)=>res.json()
            }["DashboardPage.useEffect"]).then({
                "DashboardPage.useEffect": (data)=>{
                    if (Array.isArray(data)) {
                        // Sum time tracked this week
                        const now = new Date();
                        const weekStart = new Date(now);
                        weekStart.setDate(now.getDate() - now.getDay());
                        const weekEntries = data.filter({
                            "DashboardPage.useEffect.weekEntries": (e)=>new Date(e.startedAt) >= weekStart
                        }["DashboardPage.useEffect.weekEntries"]);
                        const totalMinutes = weekEntries.reduce({
                            "DashboardPage.useEffect.totalMinutes": (sum, e)=>sum + (e.durationMinutes || 0)
                        }["DashboardPage.useEffect.totalMinutes"], 0);
                        setTimeTracked(Math.round(totalMinutes / 60));
                        // Chart: time tracked per day (last 7 days)
                        const days = [];
                        const values = [];
                        for(let i = 6; i >= 0; i--){
                            const d = new Date(now);
                            d.setDate(now.getDate() - i);
                            const label = d.toLocaleDateString();
                            days.push(label);
                            const dayEntries = data.filter({
                                "DashboardPage.useEffect.dayEntries": (e)=>{
                                    const ed = new Date(e.startedAt);
                                    return ed.toLocaleDateString() === label;
                                }
                            }["DashboardPage.useEffect.dayEntries"]);
                            values.push(dayEntries.reduce({
                                "DashboardPage.useEffect": (sum, e)=>sum + (e.durationMinutes || 0)
                            }["DashboardPage.useEffect"], 0) / 60);
                        }
                        setTimeChart({
                            labels: days,
                            values
                        });
                        setRecentActivity({
                            "DashboardPage.useEffect": (prev)=>[
                                    ...weekEntries.slice(0, 2).map({
                                        "DashboardPage.useEffect": (e)=>`Time entry: ${e.durationMinutes} min on ${e.accountId || e.taskId}`
                                    }["DashboardPage.useEffect"]),
                                    ...prev
                                ]
                        }["DashboardPage.useEffect"]);
                    }
                }
            }["DashboardPage.useEffect"]);
        }
    }["DashboardPage.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: 32,
            background: '#f8f9fb',
            minHeight: '100vh',
            fontFamily: 'Inter, Arial, sans-serif'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    marginBottom: 32,
                    fontSize: 36,
                    fontWeight: 800,
                    color: '#222'
                },
                children: "Dashboard"
            }, void 0, false, {
                fileName: "[project]/frontend/app/dashboard/page.tsx",
                lineNumber: 108,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 32,
                    marginBottom: 40
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: '#fff',
                            padding: 32,
                            borderRadius: 16,
                            flex: 1,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    color: '#0052cc',
                                    fontWeight: 700,
                                    marginBottom: 8
                                },
                                children: "Active Tasks"
                            }, void 0, false, {
                                fileName: "[project]/frontend/app/dashboard/page.tsx",
                                lineNumber: 111,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 32,
                                    fontWeight: 700
                                },
                                children: tasksCount
                            }, void 0, false, {
                                fileName: "[project]/frontend/app/dashboard/page.tsx",
                                lineNumber: 112,
                                columnNumber: 6
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/app/dashboard/page.tsx",
                        lineNumber: 110,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: '#fff',
                            padding: 32,
                            borderRadius: 16,
                            flex: 1,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    color: '#36a2eb',
                                    fontWeight: 700,
                                    marginBottom: 8
                                },
                                children: "Deals in Pipeline"
                            }, void 0, false, {
                                fileName: "[project]/frontend/app/dashboard/page.tsx",
                                lineNumber: 115,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 32,
                                    fontWeight: 700
                                },
                                children: dealsCount
                            }, void 0, false, {
                                fileName: "[project]/frontend/app/dashboard/page.tsx",
                                lineNumber: 116,
                                columnNumber: 6
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/app/dashboard/page.tsx",
                        lineNumber: 114,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: '#fff',
                            padding: 32,
                            borderRadius: 16,
                            flex: 1,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    color: '#e67e22',
                                    fontWeight: 700,
                                    marginBottom: 8
                                },
                                children: "Time Tracked (this week)"
                            }, void 0, false, {
                                fileName: "[project]/frontend/app/dashboard/page.tsx",
                                lineNumber: 119,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 32,
                                    fontWeight: 700
                                },
                                children: [
                                    timeTracked,
                                    " h"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/app/dashboard/page.tsx",
                                lineNumber: 120,
                                columnNumber: 6
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/app/dashboard/page.tsx",
                        lineNumber: 118,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/app/dashboard/page.tsx",
                lineNumber: 109,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 32,
                    marginBottom: 40
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: '#fff',
                            borderRadius: 16,
                            padding: 24,
                            flex: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$charts$2f$TasksBarChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            data: tasksChart
                        }, void 0, false, {
                            fileName: "[project]/frontend/app/dashboard/page.tsx",
                            lineNumber: 125,
                            columnNumber: 6
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/dashboard/page.tsx",
                        lineNumber: 124,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: '#fff',
                            borderRadius: 16,
                            padding: 24,
                            flex: 1,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$charts$2f$DealsPieChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            data: dealsChart
                        }, void 0, false, {
                            fileName: "[project]/frontend/app/dashboard/page.tsx",
                            lineNumber: 128,
                            columnNumber: 6
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/dashboard/page.tsx",
                        lineNumber: 127,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: '#fff',
                            borderRadius: 16,
                            padding: 24,
                            flex: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$charts$2f$TimeLineChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            data: timeChart
                        }, void 0, false, {
                            fileName: "[project]/frontend/app/dashboard/page.tsx",
                            lineNumber: 131,
                            columnNumber: 6
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/dashboard/page.tsx",
                        lineNumber: 130,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/app/dashboard/page.tsx",
                lineNumber: 123,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#fff',
                    borderRadius: 16,
                    padding: 32,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            marginBottom: 16,
                            fontWeight: 700,
                            color: '#0052cc'
                        },
                        children: "Recent Activity"
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/dashboard/page.tsx",
                        lineNumber: 135,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        style: {
                            fontSize: 16,
                            color: '#444',
                            lineHeight: 1.7
                        },
                        children: recentActivity.slice(0, 8).map((a, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: a
                            }, i, false, {
                                fileName: "[project]/frontend/app/dashboard/page.tsx",
                                lineNumber: 137,
                                columnNumber: 48
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/dashboard/page.tsx",
                        lineNumber: 136,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/app/dashboard/page.tsx",
                lineNumber: 134,
                columnNumber: 4
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/app/dashboard/page.tsx",
        lineNumber: 107,
        columnNumber: 3
    }, this);
}
_s(DashboardPage, "zhmdVQ4z7h2M9PpmqShh86OYX30=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$auth$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = DashboardPage;
var _c;
__turbopack_context__.k.register(_c, "DashboardPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_b89d284b._.js.map
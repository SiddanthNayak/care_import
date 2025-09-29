import { j as jsxRuntimeExports } from './jsx-runtime.js';

const TestPage = ({ facilityId }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-screen bg-gray-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl font-bold text-gray-800 mb-4", children: [
      "🎉 Care PlugTest Plugin ",
      facilityId
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl text-gray-600", children: "Your plugin is working successfully!" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 p-4 bg-white rounded-lg shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
      "This is a test page running on port 5273 ",
      facilityId
    ] }) })
  ] }) });
};

const routes = {
  "/facility/:facilityId/plugtest": ({
    facilityId
  }) => /* @__PURE__ */ jsxRuntimeExports.jsx(TestPage, { facilityId }),
  "/facility/:facilityId/plugtest/dashboard": ({
    facilityId
  }) => /* @__PURE__ */ jsxRuntimeExports.jsx(TestPage, { facilityId })
};

const manifest = {
  plugin: "care_plugtest",
  routes,
  extends: [],
  components: {},
  navItems: [
    {
      name: "PlugTest",
      url: "plugtest",
      icon: "CiBeaker1"
    }
  ],
  encounterTabs: {}
};

export { manifest as default };

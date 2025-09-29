import routes from "./routes";

const manifest = {
  plugin: "care_plugtest",
  routes,
  extends: [],
  components: {},
  navItems: [
    {
      name: "PlugTest",         
      url: "plugtest",         
      icon: "CiBeaker1",
    },
  ],
  encounterTabs: {},
};

export default manifest;
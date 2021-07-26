module.exports = class ProcessorViews {
  process = (express, appName, processedAnnotations) => {
    this.express = express;
    this.appName = appName;
    this.processedAnnotations = processedAnnotations;

    this.processViews();
  };

  /** Init and set views. */
  processViews = () => {
    this.handleHomeView();
    this.handleCloudFunctionsView();
    this.handleClassHooksView();
    this.handleCloudJobsView();
  };

  handleHomeView = () => {
    this.express.get("/litly-doc", (_, res) => {
      res.render("index", {
        ...this.getDefaultParams(),
        ...{ processedAnnotations: this.processedAnnotations },
      });
    });
  };

  handleCloudFunctionsView = () => {
    const { cloudFunctionAnnotations } = this.processedAnnotations;

    this.express.get("/litly-doc/cloud-functions", (_, res) => {
      res.render("cloud_functions", {
        ...this.getDefaultParams(),
        ...{ data: cloudFunctionAnnotations },
      });
    });
  };

  handleCloudJobsView = () => {
    const { cloudJobAnnotations } = this.processedAnnotations;

    this.express.get("/litly-doc/cloud-jobs", (_, res) => {
      res.render("cloud_jobs", {
        ...this.getDefaultParams(),
        ...{ data: cloudJobAnnotations },
      });
    });
  };

  handleClassHooksView = () => {
    const { classHooksAnnotations } = this.processedAnnotations;

    this.express.get("/litly-doc/class-hooks", (_, res) => {
      res.render("class_hooks", {
        ...this.getDefaultParams(),
        ...{ data: classHooksAnnotations },
      });
    });
  };

  getDefaultParams = () => {
    const { version } = require("../../package.json");

    return { appName: this.appName, version };
  };
};

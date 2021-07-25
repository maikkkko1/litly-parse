module.exports = class ProcessorViews {
  process = (express, appName, processedAnnotations) => {
    this.express = express;
    this.appName = appName;
    this.processedAnnotations = processedAnnotations;

    this.processViews();
  };

  processViews = () => {
    this.handleHomeView();
    this.handleCloudFunctionsView();
  };

  handleHomeView = () => {
    this.express.get("/litly-doc", (_, res) => {
      res.render("index", this.getDefaultParams());
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

  getDefaultParams = () => {
    const { version } = require("../../package.json");

    return { appName: this.appName, version };
  };
};

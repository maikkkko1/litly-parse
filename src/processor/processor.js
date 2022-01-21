const glob = require("glob");
const fs = require("fs");
const eol = require("eol");
const { CLOUD_FUNCTION, CLOUD_JOB } = require("../types/annotation.types");
const { removeAllOccurrencesFromString } = require("../utils/utils");

const {
  LITLY_START,
  LITLY_END,
  LITLY_NAME,
  LITLY_DESCRIPTION,
  LITLY_USE_NEXT_LINE,
  LITLY_PARAM,
  LITLY_PARSE_CLASS,
  LITLY_RESPONSE,
  LITLY_RUN_EVERY,
  LITLY_GROUP,
} = require("../types/tag.types");
const ProcessorViews = require("./processor-views");

/**
 * @author Maikon Ferreira <me@maikonferreira.tech>
 */

module.exports = class Processor {
  process = (express, appName) => {
    const cloudFunctionAnnotations = [];
    const cloudJobAnnotations = [];

    glob("**/*.js", { ignore: ["node_modules/**", "**/types/**"] }, async (er, files) => {
      for (const file of files) {
        const annotations = await this.getUnprocessedAnnotations(file);

        const processedAnnotations = this.processAnnotations(annotations);

        for (const annotationData of processedAnnotations) {
          switch (annotationData.type) {
            case CLOUD_FUNCTION:
              cloudFunctionAnnotations.push(annotationData);
              break;
            case CLOUD_JOB:
              cloudJobAnnotations.push(annotationData);
          }
        }
      }

      new ProcessorViews().process(express, appName, {
        cloudFunctionAnnotations,
        cloudJobAnnotations,
      });
    });
  };

  getUnprocessedAnnotations = (path) => {
    const annotations = [];

    return new Promise((resolve, reject) => {
      fs.readFile(path, { encoding: "utf-8" }, (err, data) => {
        if (!err) {
          while (data.includes(LITLY_START) && data.includes(LITLY_END) && !data.includes("@Litly Class")) {
            const startIndex = data.indexOf(LITLY_START);
            const endIndex = data.indexOf(LITLY_END) + 10;

            const annotation = data.substring(startIndex, endIndex);

            annotations.push({ annotation, file: path });

            data = data.replace(annotation, "");
          }

          resolve(annotations);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };

  getAnnotationType = (annotation, file) => {
    if (annotation.includes(CLOUD_FUNCTION)) return CLOUD_FUNCTION;
    if (annotation.includes(CLOUD_JOB)) return CLOUD_JOB;

    throw Error(`Unsupported Annotation Type at ${file} \nSupported types: ${CLOUD_FUNCTION} and ${CLOUD_JOB}.`);
  };

  getAnnotationName = (annotation, file) => {
    const nameTagIndex = annotation.indexOf(LITLY_NAME);

    if (nameTagIndex == -1) throw Error(`Please provide a ${LITLY_NAME} for your annotation at ${file}.`);

    return this.findTagValue(annotation, LITLY_NAME);
  };

  getAnnotationGroup = (annotation) => {
    const groupTagIndex = annotation.indexOf(LITLY_GROUP);

    if (groupTagIndex == -1) return "Common";

    return this.findTagValue(annotation, LITLY_GROUP);
  };

  getAnnotationRunEvery = (annotation, file, type) => {
    const nameTagIndex = annotation.indexOf(LITLY_RUN_EVERY);

    if (type == CLOUD_JOB) {
      if (nameTagIndex == -1) throw Error(`Please provide a ${LITLY_RUN_EVERY} for your annotation at ${file}.`);
    }

    return this.findTagValue(annotation, LITLY_RUN_EVERY);
  };

  getAnnotationDescription = (annotation) => {
    let previousLine = "";
    let value = "";

    for (let line of eol.split(annotation)) {
      line = line.replace("*", "").trim();

      const isToContinueNextLine = line.includes(LITLY_USE_NEXT_LINE);
      const isToContinueNextLinePrevious = previousLine.includes(LITLY_USE_NEXT_LINE);

      if (previousLine.includes(LITLY_DESCRIPTION) || isToContinueNextLine || isToContinueNextLinePrevious) {
        value += line;
      }

      previousLine = line;
    }

    return removeAllOccurrencesFromString(value, LITLY_USE_NEXT_LINE);
  };

  getAnnotationParams = (annotation, file) => {
    let previousLine = "";

    const params = [];

    for (let line of eol.split(annotation)) {
      line = line.replace("*", "").trim();

      if (previousLine.includes(LITLY_PARAM)) {
        if (!line.includes(":")) {
          throw Error(
            `Invalid param syntax at file ${file}. \nMissing the ':' for the type definition. \nExample: param: string`
          );
        }

        const paramSplit = line.replace(LITLY_PARSE_CLASS, "").split(":");

        params.push({
          paramName: paramSplit[0].trim(),
          paramType: paramSplit[1].trim(),
          isParseClassType: line.includes(LITLY_PARSE_CLASS),
        });
      }

      previousLine = line;
    }

    return params;
  };

  getAnnotationResponse = (annotation, file, type) => {
    let previousLine = "";
    let ignorePreviousLine = false;

    let response = "";

    if (!annotation.includes(LITLY_RESPONSE) && type == CLOUD_FUNCTION) {
      throw Error(`Please provide a ${LITLY_RESPONSE} for you annotation at file ${file}.`);
    }

    for (let line of eol.split(annotation)) {
      line = line.replace("*", "").trim();

      if (previousLine.includes(LITLY_RESPONSE) || ignorePreviousLine) {
        ignorePreviousLine = true;
        response += line;
      }

      previousLine = line;
    }

    try {
      return {
        response: JSON.parse(response.replace(LITLY_END, "").trim()),
        isJson: true,
      };
    } catch (err) {
      return {
        response: response.replace(LITLY_END, "").trim(),
        isJson: false,
      };
    }
  };

  processAnnotations = (annotations) => {
    const processedAnnotations = [];

    for (const annotationObj of annotations) {
      const { annotation, file } = annotationObj;

      const annotationData = {};

      annotationData.type = this.getAnnotationType(annotation, file);
      annotationData.name = this.getAnnotationName(annotation, file);
      annotationData.group = this.getAnnotationGroup(annotation);
      annotationData.description = this.getAnnotationDescription(annotation);
      annotationData.params = this.getAnnotationParams(annotation, file);
      annotationData.runEvery = this.getAnnotationRunEvery(annotation, file, annotationData.type);
      annotationData.response = this.getAnnotationResponse(annotation, file, annotationData.type);

      processedAnnotations.push(annotationData);
    }

    return processedAnnotations;
  };

  findTagValue = (annotation, tag) => {
    let previousLine = "";

    for (let line of eol.split(annotation)) {
      line = line.replace("*", "").trim();

      if (previousLine.includes(tag)) {
        return line;
      }

      previousLine = line;
    }

    return null;
  };
};

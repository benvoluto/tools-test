import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import { image } from "./seg-image";

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstone.registerImageLoader(
  "webImageLoader",
  cornerstoneWebImageLoader.loadImage
);

const imageId =
  "https://raw.githubusercontent.com/benvoluto/benvoluto.github.io/master/test-basic.png";

const teethShapes = image.images[0].models.tooth_segmentation.findings;
const PALETTE_TOKENS = {
  orangeRed: "rgba(255,103,55,0.41)",
  paleBlue: "rgba(113,197,244,0.2)",
  grassGreen: "#b2e06155",
  purple: "#bd7ebe55",
  yellowOrange: "#ffb55a55",
  yellow: "#ffee6555",
  lilac: "#beb9db55",
  magentaLight: "#fdcce555",
  teal: "#8bd3c755",
  paleTeal: "rgba(133,255,248,0.1)",
  paleBlueGrey: "rgba(19,106,154,.1)",
  paleGrey: "rgba(0,0,0,0.04)",
  transWhite: "rgba(255,255,255,0.25)",
};

const COLOR_TOKENS = {
  mask: {
    fill: "transparent",
    stroke: "transparent",
    strokeWidth: "3",
    strokeGradient: PALETTE_TOKENS.paleBlue,
    fillGradient: "transparent",
  },
  dentin: {
    fill: "transparent",
    fillGradient: PALETTE_TOKENS.paleBlueGrey,
    stroke: "transparent",
    strokeGradient: "transparent",
    strokeWidth: "0",
  },
  enamel: {
    fill: "transparent",
    fillGradient: "transparent",
    stroke: "transparent",
    strokeGradient: "transparent",
    strokeWidth: "0",
  },
  pulp: {
    fill: "transparent",
    stroke: PALETTE_TOKENS.paleGrey,
    strokeGradient: "transparent",
    fillGradient: PALETTE_TOKENS.paleTeal,
    strokeWidth: "3",
  },
  caries: {
    fill: "transparent",
    fillGradient: PALETTE_TOKENS.orangeRed,
    stroke: "transparent",
    strokeGradient: "transparent",
    strokeWidth: "0",
  },
  resto: {
    fill: "transparent",
    fillGradient: "transparent",
    stroke: "transparent",
    strokeGradient: "transparent",
    strokeWidth: "0",
  },
};

const makePairs = (arr, chunkSize) => {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
};

const drawSegment = (label, context, points, bBox, toothNumber, tokens) => {
  switch (label) {
    case "caries":
      let cariesFillGradient;
      context.moveTo(points[0][0], points[0][1]);
      context.beginPath();
      points.forEach((segment, index) => {
        index >= 1 && context.lineTo(segment[0], segment[1]);
      });

      // is the caries horizontal or vertical shape?
      // const isHorizOriented = (bBox.xMax > bBox.yMax);
      // const isVertOriented = (bBox.xMax < bBox.yMax);
     
      // let xPoints = points.map((point) => point[0]);
      // let yPoints = points.map((point) => point[1]);
      // let xPointsMin = Math.min(...xPoints);
      // let xPointsMax = Math.max(...xPoints);
      // let yPointsMin = Math.min(...yPoints);
      // let yPointsMax = Math.max(...yPoints);
      // let xPointsMid = (xMin + xMax) / 2;
      // let yPointsMid = (yMin + yMax) / 2;
      // // is the caries on the left or right side of the tooth?
      // const isLeftSide = (xPointsMid < bBox.xMax);
      
      if (toothNumber <= 16) {
        cariesFillGradient = context.createLinearGradient(
          0,
          0,
          0,
          bBox.yMax
        );
      } else {
        cariesFillGradient = context.createLinearGradient(
          0,
          bBox.yMax,
          0,
          bBox.yMin
        );
      }
      cariesFillGradient.addColorStop(0, "transparent");
      cariesFillGradient.addColorStop(1, tokens.fillGradient);
      context.closePath();
      context.fillStyle = cariesFillGradient;
      context.fill();
      break;

    case "resto":
      context.moveTo(points[0][0], points[0][1]);
      context.beginPath();
      points.forEach((segment, index) => {
        index >= 1 && context.lineTo(segment[0], segment[1]);
      });

      const img = new Image();
      img.src =
        "https://raw.githubusercontent.com/benvoluto/benvoluto.github.io/master/pattern.png";
      img.onload = () => {
        const pattern = context.createPattern(img, "repeat");

        points.forEach((segment, index) => {
          index >= 1 && context.lineTo(segment[0], segment[1]);
        });
        context.fillStyle = pattern;
        context.fill();
      };
      break;

    default:
      const firstPoint = points[0];
      context.moveTo(firstPoint[0], firstPoint[1]);
      context.beginPath();
      points.forEach((segment, index) => {
        index >= 1 && context.lineTo(segment[0], segment[1]);
      });
      context.closePath();
      if (tokens.fillGradient !== "transparent") {
        let fillGradient;
        if (toothNumber <= 16) {
          fillGradient = context.createLinearGradient(
            0,
            0,
            0,
            bBox.yMax * 0.75
          );
        } else {
          fillGradient = context.createLinearGradient(
            0,
            bBox.yMax * 0.75,
            0,
            bBox.yMin
          );
        }
        fillGradient.addColorStop(0, "transparent");
        fillGradient.addColorStop(1, tokens.fillGradient);
        context.fillStyle = fillGradient;
        context.fill();
      }
      if (tokens.strokeGradient !== "transparent") {
        let strokeGradient;
        if (toothNumber <= 16) {
          strokeGradient = context.createLinearGradient(0, 0, 0, bBox.yMax * 0.8);
        } else {
          strokeGradient = context.createLinearGradient(
            0,
            bBox.yMax * 0.7,
            0,
            bBox.yMin
          );
        }
        strokeGradient.addColorStop(0, "transparent");
        strokeGradient.addColorStop(1, tokens.strokeGradient);
        context.strokeStyle = strokeGradient;
        context.lineWidth = tokens["strokeWidth"];
        context.stroke();
      } 
      if (tokens.stroke !== "transparent") {
        context.strokeStyle = tokens.stroke;
        context.lineWidth = tokens["strokeWidth"];
        context.stroke();
      }
      break;
  }

  return true;
};

const CornerstoneViewer = ({ imageId, dimensions, setDimensions }) => {
  const viewportDiv = useRef(null);

  const toothMasks = teethShapes.filter(segment => segment.label === 'mask');
  // const toothBoundingBoxes = toothMasks.map((segment) => {
  //   let xPoints = segment.points.map((point) => point[0]);
  //   let yPoints = segment.points.map((point) => point[1]);
  //   let xPointsMin = Math.min(...xPoints);
  //   let xPointsMax = Math.max(...xPoints);
  //   let yPointsMin = Math.min(...yPoints);
  //   let yPointsMax = Math.max(...yPoints);
  // });

  useEffect(() => {
    if (viewportDiv.current && imageId && dimensions) {
      const element = viewportDiv.current;
      cornerstone.enable(element);
      cornerstone.loadImage(imageId).then((image) => {
        cornerstone.displayImage(element, image);
        element.addEventListener("cornerstoneimagerendered", function (e) {
          const context = e.detail.canvasContext.canvas.getContext("2d");
          context.rect(0, 0, 846, 662);
          context.fillStyle = "rgba(0,37,92,0.13)";
          context.fill();
          teethShapes.forEach((segment) => {
            const toothNumber = segment.toothNumber;
            const maskPoints = makePairs(segment.vertices, 2);
            const label = segment.label;
            const bBox = {
              xMin: segment.xMin,
              yMin: segment.yMin,
              xMax: segment.xMax,
              yMax: segment.yMax,
            };
            drawSegment(
              label,
              context,
              maskPoints,
              bBox,
              toothNumber,
              COLOR_TOKENS[label]
            );
          });
        });
      });
    }

    return () => {
      if (viewportDiv.current) {
        cornerstone.disable(viewportDiv.current);
      }
    };
  }, [imageId]);

  return <div ref={viewportDiv} style={{ width: "100vw", height: "100vh" }} />;
};

const App = () => {
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });
  return (
    <div className="App">
      <CornerstoneViewer
        setDimensions={setDimensions}
        dimensions={dimensions}
        imageId={imageId}
        className="canvas"
      />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

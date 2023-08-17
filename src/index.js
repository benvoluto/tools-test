import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import { oneImage } from "./one-image";

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstone.registerImageLoader(
  "webImageLoader",
  cornerstoneWebImageLoader.loadImage
);

const imageId =
  "https://raw.githubusercontent.com/benvoluto/benvoluto.github.io/master/bw-sample.jpg";

const teethShapes = oneImage.models.tooth_identification.findings;
const imageWidth = oneImage.imageDimension.widthPx;
const imageHeight = oneImage.imageDimension.heightPx;

const SCALE = 0.84;
const THUMBNAIL_SCALE = 0.9;

const COLORS = [
  "#fd7f6f55",
  "#7eb0d555",
  "#b2e06155",
  "#bd7ebe55",
  "#ffb55a55",
  "#ffee6555",
  "#beb9db55",
  "#fdcce555",
  "#8bd3c755",
];

const makePairs = (arr, chunkSize) => {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
};

const drawTooth = (context, points, scale, color, toothBox, toothNumber) => {
  context.beginPath();
  const startPoint = points[0];
  context.moveTo(startPoint[0] * scale, startPoint[1] * scale);
  points.forEach((segment, index) => {
    index >= 1 && context.lineTo(segment[0] * scale, segment[1] * scale);
  });
  context.closePath();

  const upperGrad = context.createLinearGradient(0, 0, 0, toothBox.yMax);
  const lowerGrad = context.createLinearGradient(
    0,
    toothBox.yMax,
    0,
    toothBox.yMin
  );
  const grad = toothNumber < 16 ? upperGrad : lowerGrad;
  grad.addColorStop(0, "transparent");
  grad.addColorStop(1, color);
  context.strokeStyle = grad;
  context.lineWidth = 5;
  context.stroke();
  // context.strokeStyle = color;
  // context.fillStyle = color;
  // context.fill();
};

const CornerstoneViewer = ({ imageId, dimensions, setDimensions }) => {
  const viewportDiv = useRef(null);

  useEffect(() => {
    if (viewportDiv.current && imageId && dimensions) {
      const element = viewportDiv.current;
      cornerstone.enable(element);
      cornerstone.loadImage(imageId).then((image) => {
        cornerstone.displayImage(element, image);
        element.addEventListener("cornerstoneimagerendered", function (e) {
          const context = e.detail.canvasContext.canvas.getContext("2d");
          teethShapes.forEach((tooth, index) => {
            const toothNumber = tooth.toothNumber;
            const maskPoints = makePairs(tooth.toothMask, 2);
            const toothBox = {
              xMin: tooth.xMin,
              yMin: tooth.yMin,
              xMax: tooth.xMax,
              yMax: tooth.yMax,
            };
            drawTooth(
              context,
              maskPoints,
              SCALE,
              COLORS[index],
              toothBox,
              toothNumber
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
  }, [imageId, dimensions]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div ref={viewportDiv} style={{ width: '100vw', height: '100vh' }} />;
};

const App = () => {
  const [dimensions, setDimensions] = useState({ 
    height: window.innerHeight,
    width: window.innerWidth
  })
  return (
    <div className="App">
      <CornerstoneViewer setDimensions={setDimensions} dimensions={dimensions} imageId={imageId} className="canvas" style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

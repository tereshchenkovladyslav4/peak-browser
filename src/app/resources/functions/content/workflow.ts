import { DiagramView, DiagramLine, DiagramPoint, DiagramViewExtended, DiagramObject, DiagramObjType, ContentType_V1 } from "../../models/content";

export function roundPathCorners(pathString: string, radius: number, useFractionalRadius: boolean) {
  function moveTowardsLength(movingPoint, targetPoint, amount) {
      var width = (targetPoint.x - movingPoint.x);
      var height = (targetPoint.y - movingPoint.y);

      var distance = Math.sqrt(width * width + height * height);

      return moveTowardsFractional(movingPoint, targetPoint, Math.min(1, amount / distance));
  }
  function moveTowardsFractional(movingPoint, targetPoint, fraction) {
      return {
          x: movingPoint.x + (targetPoint.x - movingPoint.x) * fraction,
          y: movingPoint.y + (targetPoint.y - movingPoint.y) * fraction
      };
  }

  // Adjusts the ending position of a command
  function adjustCommand(cmd, newPoint) {
      if (cmd.length > 2) {
          cmd[cmd.length - 2] = newPoint.x;
          cmd[cmd.length - 1] = newPoint.y;
      }
  }

  // Gives an {x, y} object for a command's ending position
  function pointForCommand(cmd) {
      return {
          x: parseFloat(cmd[cmd.length - 2]),
          y: parseFloat(cmd[cmd.length - 1])
      };
  }

  // Split apart the path, handing concatonated letters and numbers
  var pathParts = pathString
      .split(/[,\s]/)
      .reduce(function (parts, part) {
          var match = part.match("([a-zA-Z])(.+)");
          if (match) {
              parts.push(match[1]);
              parts.push(match[2]);
          } else {
              parts.push(part);
          }

          return parts;
      }, []);

  // Group the commands with their arguments for easier handling
  var commands = pathParts.reduce(function (commands, part) {
      if (parseFloat(part) == part && commands.length) {
          commands[commands.length - 1].push(part);
      } else {
          commands.push([part]);
      }

      return commands;
  }, []);

  // The resulting commands, also grouped
  var resultCommands = [];

  if (commands.length > 1) {
      var startPoint = pointForCommand(commands[0]);

      // Handle the close path case with a "virtual" closing line
      var virtualCloseLine = null;
      if (commands[commands.length - 1][0] == "Z" && commands[0].length > 2) {
          virtualCloseLine = ["L", startPoint.x, startPoint.y];
          commands[commands.length - 1] = virtualCloseLine;
      }

      // We always use the first command (but it may be mutated)
      resultCommands.push(commands[0]);

      for (var cmdIndex = 1; cmdIndex < commands.length; cmdIndex++) {
          var prevCmd = resultCommands[resultCommands.length - 1];

          var curCmd = commands[cmdIndex];

          // Handle closing case
          var nextCmd = (curCmd == virtualCloseLine)
              ? commands[1]
              : commands[cmdIndex + 1];

          // Nasty logic to decide if this path is a candidite.
          if (nextCmd && prevCmd && (prevCmd.length > 2) && curCmd[0] == "L" && nextCmd.length > 2 && nextCmd[0] == "L") {
              // Calc the points we're dealing with
              var prevPoint = pointForCommand(prevCmd);
              var curPoint = pointForCommand(curCmd);
              var nextPoint = pointForCommand(nextCmd);

              // The start and end of the cuve are just our point moved towards the previous and next points, respectivly
              var curveStart, curveEnd;

              if (useFractionalRadius) {
                  curveStart = moveTowardsFractional(curPoint, prevCmd.origPoint || prevPoint, radius);
                  curveEnd = moveTowardsFractional(curPoint, nextCmd.origPoint || nextPoint, radius);
              } else {
                  curveStart = moveTowardsLength(curPoint, prevPoint, radius);
                  curveEnd = moveTowardsLength(curPoint, nextPoint, radius);
              }

              // Adjust the current command and add it
              adjustCommand(curCmd, curveStart);
              curCmd.origPoint = curPoint;
              resultCommands.push(curCmd);

              // The curve control points are halfway between the start/end of the curve and
              // the original point
              var startControl = moveTowardsFractional(curveStart, curPoint, .5);
              var endControl = moveTowardsFractional(curPoint, curveEnd, .5);

              // Create the curve 
              var curveCmd = ["C", startControl.x, startControl.y, endControl.x, endControl.y, curveEnd.x, curveEnd.y];
              // Save the original point for fractional calculations

              // MAY NEED TO GET THIS FUNCTIONAL
              // curveCmd.origPoint = curPoint;
              
              resultCommands.push(curveCmd);
          } else {
              // Pass through commands that don't qualify
              resultCommands.push(curCmd);
          }
      }

      // Fix up the starting point and restore the close path if the path was orignally closed
      if (virtualCloseLine) {
          var newStartPoint = pointForCommand(resultCommands[resultCommands.length - 1]);
          resultCommands.push(["Z"]);
          adjustCommand(resultCommands[0], newStartPoint);
      }
  } else {
      resultCommands = commands;
  }

  return resultCommands.reduce(function (str, c) { return str + c.join(" ") + " "; }, "");
}

export function prepareView(view: DiagramView): DiagramView {
  for (var i = 0; i < view?.objects?.length; i++) {
    view.objects[i].basePtX *= 100.0;
    view.objects[i].basePtY *= 100.0;
    view.objects[i].sizeX *= 100.0;
    view.objects[i].sizeY *= 100.0;
  }

  for (var i = 0; i < view?.lines?.length; i++) {
    let curline: DiagramLine = view?.lines[i];

    for (var j = 0; j < curline?.arrowPoints?.length; j++) {
      let p: DiagramPoint = curline?.arrowPoints[j];
      p.x *= 100.0;
      p.y *= 100.0;
    }

    for (var j = 0; j < curline?.linePoints?.length; j++) {
      let p: DiagramPoint = curline?.linePoints[j];
      p.x *= 100.0;
      p.y *= 100.0;

      //Labelpoints and labelAnchor will not come from server so we are setting it to default here.
      curline.labelPoints = new DiagramPoint();
      curline.labelAnchor = "start"; 
      setLabelPoint(curline);
    }
  }

  return view;
}

export function mapDiagramViewToDiagramViewExtended(diagramView: DiagramView): DiagramViewExtended {
  return {
    ...diagramView,
    objects: diagramView?.objects.map(obj => ({
      ...obj,
      textColorHex: toColor(obj?.textColor),
      borderColorHex: toColor(obj?.borderColor),
      color1Hex: toColor(obj?.color1),
      color2Hex: toColor(obj?.color2),
      objType: getObjectDiagramType(obj),
      wrappedName: getWrappedName(obj),
      wrappedAssigned: getWrappedAssigned(obj),
      decisionGeom: decisionGeom(obj),
      processGeom: processGeom(obj)
    })),
    lines: diagramView?.lines.map(line => ({
      ...line,
      lineGeom: lineGeom(line),
      arrowGeom: arrowGeom(line)
    }))
  }
}

function toColor(num: number) {
  num >>>= 0;
  var r = num & 0xFF,
      g = (num & 0xFF00) >>> 8,
      b = (num & 0xFF0000) >>> 16,
      a = ((num & 0xFF000000) >>> 24) / 255;
  return "#" + rgb2hex(r, g, b);
}

function rgb2hex(r: number, g: number, b: number): string {
  return g !== undefined ? 
    Number(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).substring(1) :
    Number(0x1000000 + r[0] * 0x10000 + r[1] * 0x100 + r[2]).toString(16).substring(1);
}

function getObjectDiagramType(obj: DiagramObject): DiagramObjType {
  if (obj?.contentType === ContentType_V1.task) {
    return obj?.isMilestone ? 'milestone' : 'task';
  }

  return 'process';
}

function setLabelPoint(line: DiagramLine): void {
  if (line.label != "") {
    let LabelTop = 0;
    let LabelBottom = 1;
    let LabelLeft = 2;
    let LabelRight = 3;
    let nSide = LabelRight;

    // determine side
    if (Math.abs(line.linePoints[0].x - line.linePoints[1].x) < .0001) {
      // x's are the same, vertical
      if (line.linePoints[0].y > line.linePoints[1].y)
        nSide = LabelTop;
      else
        nSide = LabelBottom;
    } else {
      // y's are the same, horz
      if (line.linePoints[0].x > line.linePoints[1].x)
        nSide = LabelLeft;
      else
        nSide = LabelRight;
    }

    switch (nSide) {
      case LabelTop:
      case LabelRight:
        line.labelAnchor = "start";
        line.labelPoints.x = line.linePoints[0].x + 5;
        line.labelPoints.y = line.linePoints[0].y - line.label.length - 5;
        break;
      case LabelBottom:
        line.labelAnchor = "start";
        line.labelPoints.x = line.linePoints[0].x + 5;
        line.labelPoints.y = line.linePoints[0].y + 20;
        break;
      case LabelLeft:
        line.labelAnchor = "end";
        line.labelPoints.x = line.linePoints[0].x - 5;
        line.labelPoints.y = line.linePoints[0].y - line.label.length - 5;
        break;
      default:
        break;
    }
  }
}

function getWrappedName(obj: DiagramObject): Array<string> {
  let NameWrap: Array<string> = new Array<string>();

  // for word wrap, we need to do some work
  let full_name: string = obj.seqPrefix + obj.seq + " -" + obj.name;

  let parts: string[] = full_name.split(" ");
  let cur_string: string = "";
  for (var j = 0; j < parts.length; j++) {
      if (getWidthOfText(cur_string + " " + parts[j], "Arial", 9) > (obj.sizeX - 30)) {
        NameWrap.push(cur_string);
        cur_string = "";
        // check if the next item by itself is longer than we want
        if (getWidthOfText(cur_string, "Arial", 9) > (obj.sizeX - 30)) {
          // if it is, just add that single item and go on to next line
          NameWrap.push(parts[j]);
          cur_string = "";
        }
      }
      if (j > 0) cur_string += " ";
      cur_string += parts[j];
  }
  NameWrap.push(cur_string);
  return NameWrap;
}

function getWrappedAssigned(obj: DiagramObject): Array<string> {
    let NameWrap: Array<string> = new Array<string>();

    // for word wrap, we need to do some work
    let full_name: string = obj.assignedTo;

    let parts: string[] = full_name.split(" ");
    let cur_string: string = "";
    for (var j = 0; j < parts.length; j++) {
      if (getWidthOfText(cur_string + " " + parts[j], "Arial", 9) > (obj.sizeX - 30)) {
        NameWrap.push(cur_string);
        cur_string = "";
        // check if the next item by itself is longer than we want
        if (getWidthOfText(cur_string, "Arial", 9) > (obj.sizeX - 30)) {
          // if it is, just add that single item and go on to next line
          NameWrap.push(parts[j]);
          cur_string = "";
        }
      }
      if (j > 0) cur_string += " ";
      cur_string += parts[j];
    }
    NameWrap.push(cur_string);
    return NameWrap;
}

function getWidthOfText(txt: string, fontname: string, fontsize: number): number {
  // Create a dummy canvas (render invisible with css)
  var c = document.createElement('canvas');
  // Get the context of the dummy canvas
  var ctx = c.getContext('2d');
  // Set the context.font to the font that you are using
  ctx.font = fontsize + fontname;
  // Measure the string 
  // !!! <CRUCIAL>  !!!
  var length = ctx.measureText(txt).width;
  // !!! </CRUCIAL> !!!
  // Return width
  return length;
}

function lineGeom(line: DiagramLine): string {
  let geom: string = "";
  for (var i = 0; i < line.linePoints.length; i++) {
    if (i == 0) {
      geom = "M " + line.linePoints[i].x + " " + line.linePoints[i].y + " ";
    } else {
      geom += "L " + line.linePoints[i].x + " " + line.linePoints[i].y + " ";
    }
  }

  return roundPathCorners(geom, 10, false);
}

function arrowGeom(line: DiagramLine): string {
    let geom: string = "";
    for (var i = 0; i < line.arrowPoints.length; i++) {
      geom += line.arrowPoints[i].x + ", " + line.arrowPoints[i].y + "  ";
    }

    return geom;
}

function decisionGeom(obj: DiagramObject): string {
  let geom: string = "";
  geom = obj.basePtX + "," + (obj.basePtY + obj.sizeY / 2) + "   " +
      (obj.basePtX + obj.sizeX / 2) + "," + obj.basePtY + "   " +
      (obj.basePtX + obj.sizeX) + "," + (obj.basePtY + obj.sizeY / 2) + "   " +
      (obj.basePtX + obj.sizeX / 2) + "," + (obj.basePtY + obj.sizeY) + "   ";
  return geom;
}

function processGeom(obj: DiagramObject): string {
  let geom: string = "";
  let r: number = 15.0;
  let left = obj.basePtX;
  let right = obj.basePtX + obj.sizeX;
  let top = obj.basePtY + obj.sizeY;
  let bottom = obj.basePtY;

  geom = (left + r) + "," + top + "   " +
      (right - r) + "," + top + "   " +
      (right) + "," + (top - r) + "   " +
      (right) + "," + (bottom + r) + "   " +
      (right - r) + "," + (bottom) + "   " +
      (left + r) + "," + (bottom) + "   " +
      (left) + "," + (bottom + r) + "   " +
      (left) + "," + (top - r) + "   ";

  return geom;
}
import { mapDiagramViewToDiagramViewExtended, prepareView } from './workflow';
import {
  DiagramView,
  DiagramObject,
  DiagramLine,
  DiagramPoint,
  DiagramViewExtended,
  DiagramObjType,
  ContentType_V1,
  DiagramAlignHorz_T,
  DiagramAlignVert_T,
  DiagramTextOrient_T,
  DiagramTextSize_T,
  DiagramFillType_T,
} from '../../models/content';
import 'jest-canvas-mock';

describe('mapDiagramViewToDiagramViewExtended function', () => {
  test('maps diagram view to extended format', () => {
    const diagramView: DiagramView = {
      viewId: null,
      topLeftX: null,
      topLeftY: null,
      zoomFactor: null,
      objects: [
        {
          contentId: null,
          name: 'Autodesk Design Review',
          assignedTo: '(<Unassigned>)',
          contentType: ContentType_V1.task,
          description: null,
          color1: 255,
          color2: 8421504,
          basePtX: 0.5,
          basePtY: 0.5,
          textColor: 16711680,
          borderColor: 65280,
          sizeX: 1,
          sizeY: 1,
          isDisabled: null,
          textAlignHorz: null,
          textAlignVert: null,
          textOrient: null,
          textSize: null,
          isDecision: null,
          isMilestone: null,
          isSwimlane: null,
          seq: 1,
          seqPrefix: '',
          fillType: null,
        },
      ],
      lines: [
        {
          objectId1: null,
          objectId2: null,
          gripIndex1: null,
          gripIndex2: null,
          label: 'Test Label',
          linePoints: [
            {
              x: 0,
              y: 0,
            },
            {
              x: 1,
              y: 1,
            },
            {
              x: 0,
              y: 1,
            },
          ],
          arrowPoints: [
            {
              x: 0,
              y: 0,
            },
            {
              x: 1,
              y: 1,
            },
          ],
          labelPoints: {
            x: 0,
            y: 0,
          },
          labelAnchor: null,
        },
      ],
    };

    const result = mapDiagramViewToDiagramViewExtended(prepareView(diagramView));

    expect(result.objects[0].textColorHex).toBe('#0000ff');
    expect(result.objects[0].borderColorHex).toBe('#00ff00');
    expect(result.objects[0].color1Hex).toBe('#ff0000');
    expect(result.objects[0].color2Hex).toBe('#808080');
    expect(result.objects[0].objType).toBe('task');
    expect(result.objects[0].wrappedName).toStrictEqual(['1 -Autodesk Design Review']);
    expect(result.objects[0].wrappedAssigned).toStrictEqual(['(<Unassigned>)']);
    expect(result.objects[0].decisionGeom).toBe('50,100   100,50   150,100   100,150   ');
    expect(result.objects[0].processGeom).toBe(
      '65,150   135,150   150,135   150,65   135,50   65,50   50,65   50,135   ',
    );

    expect(result.lines[0].lineGeom).toBe('M 0 0 L 92.92893218813452 92.92893218813452 C 96.46446609406726 96.46446609406726 95 100 90 100 L 0 100  ');
    expect(result.lines[0].arrowGeom).toBe('0, 0  100, 100  ');
  });
});

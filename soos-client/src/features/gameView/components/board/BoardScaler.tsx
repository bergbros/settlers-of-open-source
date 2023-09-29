import { useEffect, useState, memo } from 'react';
import { Board } from './Board';

const hexWidth = 100;
const hexHeight = 120;
const numRows = 7;
const numCols = 7;

// how much smaller is a Unit than a Square?

function getInitialXOffset() {
  const boardWidth = numCols * hexWidth;
  const windowWidth = window.innerWidth;
  return windowWidth / 2 - boardWidth / 2;
}

function getInitialYOffset() {
  const boardHeight = numRows * hexHeight;
  const windowHeight = window.innerHeight;
  return windowHeight / 2 - boardHeight / 2;
}

const mouseEvents = [
  'mousedown',
  'mouseup',
  'mousemove',
  'touchstart',
  'touchend',
  'touchcancel',
  'touchmove',
  'wheel',
];

const unitKinds = [
  '⚔️',
  '🧙',
  '🌾',
];
type BoardScalerProps = {
  children: React.ReactNode;
};

function BoardScaler(props:BoardScalerProps) {
  const { children } = props;
  const [ vsn, setVsn ] = useState<number>(0);
  const triggerRerender = () => {
    setVsn(vsn + 1);
  };

  const [ xOffset, setXOffset ] = useState<number>(getInitialXOffset());
  const [ yOffset, setYOffset ] = useState<number>(getInitialYOffset());

  const [ dragging, setDragging ] = useState<boolean>(false);
  const [ lastMouseX, setLastMouseX ] = useState<number>(0);
  const [ lastMouseY, setLastMouseY ] = useState<number>(0);
  const [ mouseDownTime, setMouseDownTime ] = useState<number>(0);
  const [ scale, setScale ] = useState<number>(1);

  useEffect(() => {
    const container = document.getElementById('gameBoardContainer');
    const handleDrag = ((evt: MouseEvent | TouchEvent | WheelEvent) => {
      let evtX = 0;
      let evtY = 0;
      if (evt.type.startsWith('touch')) {
        evt.preventDefault();

        const touch = (evt as TouchEvent).changedTouches[0];
        if (touch) {
          evtX = touch.clientX;
          evtY = touch.clientY;
        }
      } else if (evt.type.startsWith('mouse')) {
        const mouseEvt = evt as MouseEvent;

        evtX = mouseEvt.clientX;
        evtY = mouseEvt.clientY;

        if (mouseEvt.button === 3) {
          // ignore right clicks
          return;
        }
      }

      switch (evt.type) {
      case 'touchstart':
      case 'mousedown':
        console.log('mouse down!');
        setDragging(true);
        setLastMouseX(evtX);
        setLastMouseY(evtY);
        setMouseDownTime(new Date().getTime());
        break;
      case 'touchend':
      case 'touchcancel':
      case 'mouseup':
        setDragging(false);
        break;
      case 'touchmove':
      case 'mousemove':
        const dx = evtX - lastMouseX;
        const dy = evtY - lastMouseY;
        const distanceSq = dx * dx + dy * dy;

        if (dragging && (new Date().getTime() - mouseDownTime > 100 || distanceSq > 500)) {
          console.log('Mouse move!');
          setXOffset(xOffset + dx);
          setYOffset(yOffset + dy);

          setLastMouseX(evtX);
          setLastMouseY(evtY);
        }
        break;
      case 'wheel':
        const wheelEvt = evt as WheelEvent;
        const scrollAmount = 1 - (wheelEvt.deltaY * .0002);
        setScale(scale * scrollAmount);
        break;
      }
    }) as EventListener;
    mouseEvents.forEach(evt => {
      container?.addEventListener(evt, handleDrag);
    });

    function handleResize() {
      triggerRerender();
      // TODO pan the map?
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mouseEvents.forEach(evt => {
        container?.removeEventListener(evt, handleDrag);
      });
    };
  });

  const containerStyles = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const boardStyle = {
    top: yOffset,
    left: xOffset,
    transform: `scale(${scale},${scale})`,
  };

  return (
    <div id="gameBoardContainer" style={containerStyles} >
      <div id="gameBoard" style={boardStyle}>
        {children}
      </div>
    </div>
  );
}

export default BoardScaler;

import { AllResourceTypes, ResourceType, resourceToLand, resourceToSymbol } from 'soos-gamelogic';
import './ResourceBar.scss';

export type ResourceBarProps = {
  resources: number[];
  onTradeButtonClicked: () => void;
};

export const ResourceBar = (props: ResourceBarProps) => {
  return <div className='resourceBar'>
    {
      AllResourceTypes.map(index =>
        <div key={index} className={'resource ' + resourceToLand(index )}>
          {resourceToSymbol(index )} {props.resources[index]}
        </div>,
      )
    }
    <button onClick={props.onTradeButtonClicked}>
      Trade Resources
    </button>
  </div>;

  // <div className='resourceBarContainer'>
  //   {/* <div className='resourceBarLabel'>My Resources</div> */}

  //   {/*
  //   <div className='resourceBarLabel'>

  //   </div> */}
  // </div>
};

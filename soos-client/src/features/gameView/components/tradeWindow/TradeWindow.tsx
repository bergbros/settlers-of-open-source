import * as React from 'react';
import { AllResourceTypes, resourceToString } from 'soos-gamelogic';
import './TradeWindow.scss';

type TradeWindowProps = {
  tradeRatio: number[];
  resources: number[];
  closeWindowHandler: () => void;
  executeTradeHandler: (tradeIn: number, tradeFor: number) => void;
};

export const TradeWindow = (props: TradeWindowProps) => {
  const { tradeRatio, resources, closeWindowHandler, executeTradeHandler } =
    props;

  const [step, setStep] = React.useState<'trade' | 'prize' | 'confirm'>(
    'trade',
  );
  const [tradeResource, setTradeResource] = React.useState<number>();
  const [prizeResource, setPrizeResource] = React.useState<number>();

  function onCancel() {
    setStep('trade');
    setTradeResource(undefined);
    setPrizeResource(undefined);
  }

  function onClose() {
    onCancel();
    closeWindowHandler();
  }

  function onSubmit() {
    if (tradeResource !== undefined && prizeResource !== undefined) {
      console.log("trading");
      executeTradeHandler(tradeResource, prizeResource);
    }
    onClose();
  }

  return (
    <div id="tradeModal" className="modal TradeModal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="close" onClick={onClose}>
            &times;
          </span>
          <h2>Available Trades:</h2>
        </div>
        <div className="modal-body">
          {step === 'trade' && (
            <div className="TradeInButtons">
              {AllResourceTypes.map((resource) => (
                <button
                  className="ActionButton"
                  disabled={resources[resource] < tradeRatio[resource]}
                  onClick={() => (setTradeResource(resource), setStep('prize'))}
                >
                  {`Trade ${tradeRatio[resource]} ${resourceToString(
                    resource,
                  )}`}
                </button>
              ))}
            </div>
          )}
          {step === 'prize' && (
            <>
              {tradeResource &&
                `Trade in ${tradeRatio[tradeResource]} ${resourceToString(
                  tradeResource,
                )}`}
              <div className="TradeInButtons">
                {AllResourceTypes.map((resource) => (
                  <button
                    className="ActionButton"
                    onClick={() => (
                      setPrizeResource(resource), setStep('confirm')
                    )}
                  >
                    {`Trade for 1 ${resourceToString(resource)}`}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 'confirm' && (
            <>
              {tradeResource &&
                `Trade in ${tradeRatio[tradeResource]} ${resourceToString(
                  tradeResource,
                )} for 1 ${resourceToString(
                  prizeResource,
                )} - execute trade now?`}
              <div className="TradeInButtons">
                <button className="ActionButton" onClick={onCancel}>
                  Cancel
                </button>
                <button className="ActionButton" onClick={onSubmit}>
                  Submit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

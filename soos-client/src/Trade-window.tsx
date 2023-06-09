import { useState } from 'react';
import { AllResourceTypes, Game, resourceToString } from 'soos-gamelogic';

export type TradeWindowProps = {
    tradeRatio: number[];
    resources: number[];
    closeWindowHandler: () => void;
    executeTradeHandler: (tradeIn: number, tradeFor: number) => void;
};

export default function TradeWindow(props: TradeWindowProps) {
    const { tradeRatio, resources, closeWindowHandler, executeTradeHandler } = props;
    const tradeOptions = [];
    const [tradeResourceSelection, setTradeResourceSelection] = useState<number | undefined>(undefined);
    const [prizeResourceSelection, setPrizeResourceSelection] = useState<number | undefined>(undefined);

    let tradeText = '';
    //First step: select what to trade IN
    if (tradeResourceSelection === undefined) {
        for (const resource of AllResourceTypes) {
            tradeOptions.push(<button
                className="ActionButton"
                disabled={resources[resource] < tradeRatio[resource]}
                onClick={() => setTradeResourceSelection(resource)}
            >{'Trade ' + tradeRatio[resource] + ' ' + resourceToString(resource)}</button>);
        }

        // Second step: select what you want to trade FOR
    } else if (prizeResourceSelection === undefined) {
        for (const resource of AllResourceTypes) {
            tradeOptions.push(<button
                className="ActionButton"
                disabled={false}
                onClick={() => setPrizeResourceSelection(resource)}
            >{'Trade for 1 ' + resourceToString(resource)}</button>);
        }
        tradeText = 'Trade in ' + tradeRatio[tradeResourceSelection] + ' ' + resourceToString(tradeResourceSelection);

        //Final step - finalize the trade!
    } else {
        tradeText = 'Trade in ' + tradeRatio[tradeResourceSelection] + ' ' + resourceToString(tradeResourceSelection)
            + ' for 1 ' + resourceToString(prizeResourceSelection) + ' - execute trade now?';

        tradeOptions.push(<button
            className="ActionButton"
            onClick={() => {
                executeTradeHandler(tradeResourceSelection, prizeResourceSelection);
                setTradeResourceSelection(undefined);
                setPrizeResourceSelection(undefined);
            }}
        >{'Yes!'}</button>);
        tradeOptions.push(<button
            className="ActionButton"
            onClick={() => { setTradeResourceSelection(undefined); setPrizeResourceSelection(undefined); }}>{'Cancel'}</button>);
    }
    return (
        <div id="tradeModal" className="modal">
            <div className="modal-content">
                <div className="modal-header">
                    <span className="close" onClick={closeWindowHandler}>&times;</span>
                    <h2>Available Trades:</h2>
                </div>
                <div className="modal-body">
                    <div className="TradeForSelector">{tradeText}</div>
                    <div className="TradeInButtons" >{tradeOptions}</div>
                </div>
            </div>
        </div>
    );
}
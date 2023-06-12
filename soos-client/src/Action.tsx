
export type ActionProps = {
    actionJSON: string;
};

export default function Action(props: ActionProps) {
    const { actionJSON } = props;
    return (
        <div className={'Action'}>
            {actionJSON}
        </div>
    );
}

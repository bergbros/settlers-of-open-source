
export type ActionProps = {
    actionJSON: string;
};

export const Action = (props: ActionProps) => {
    const { actionJSON } = props;
    return (
        <div className={'Action'}>
            {actionJSON}
        </div>
    );
}

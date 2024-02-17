import { Tooltip as Tooltips } from '@rneui/themed';
import React from 'react';
const Tooltip = (props) => {
    const [open, setOpen] = React.useState(false);
    return (
        <Tooltips
            visible={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            {...props}
        />
    );
}

export default Tooltip
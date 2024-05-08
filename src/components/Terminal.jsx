import { Terminal as XTerminal } from '@xterm/xterm'
import React from 'react'
import socket from '../socket'
import "@xterm/xterm/css/xterm.css"

const Terminal = () => {
    const terminalRef = React.useRef()

    React.useEffect(() => {
        const xTerminal = new XTerminal({
            rows: 20
        })
        xTerminal.open(terminalRef.current)

        xTerminal.onData(data => {
            socket.emit('terminal:write', data);
        })

        socket.on('terminal:data', data => {
            xTerminal.write(data)
        })

        return () => {
            socket.off('terminal:data', data => {
                xTerminal.write(data)
            })
        }
    }, [])

    return (
        <div id='terminal' ref={terminalRef}></div>
    )
}

export default Terminal
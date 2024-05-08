import React from 'react'
import Terminal from './components/Terminal'
import Files from './components/Files'
import socket from './socket'
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-solarized_dark";
import "ace-builds/src-noconflict/ext-language_tools";

const App = () => {
    const [fileTree, setFileTree] = React.useState({})
    const [selectedFile, setSelectedFile] = React.useState("")
    const [selectedFileContent, setSelectedFileContent] = React.useState("")
    const [code, setCode] = React.useState('')

    const isSaved = code === selectedFileContent

    const getFileTree = async () => {
        const response = await fetch('http://localhost:9000/files')
        const data = await response.json()
        setFileTree(data.tree)
    }

    React.useEffect(() => {
        getFileTree()
    }, [])

    React.useEffect(() => {
        setCode('')
    }, [selectedFile])

    const getFilesContent = React.useCallback(async () => {
        if (!selectedFile) return
        const response = await fetch(`http://localhost:9000/files/content?path=${selectedFile.replace("./", "/")}`)
        const result = await response.json()
        console.log(result.content);
        setSelectedFileContent(result.content)
    }, [selectedFile])

    React.useEffect(() => {
        if (selectedFile && selectedFileContent) {
            setCode(selectedFileContent)
        }
    }, [selectedFile, selectedFileContent])

    React.useEffect(() => {
        if (selectedFile) getFilesContent()
    }, [getFilesContent, selectedFile])

    React.useEffect(() => {
        if (code && !isSaved) {
            const timer = setTimeout(() => {
                socket.emit("file:change", {
                    path: selectedFile.replace("./", "/"),
                    content: code
                })
            }, 5 * 1000)
            return () => clearTimeout(timer)
        }
    }, [code, isSaved, selectedFile])

    React.useEffect(() => {
        socket.on('file:refresh', (data) => {
            console.log(data);
            getFileTree()
        })
        return () => {
            socket.off('file:refresh', () => {
                getFileTree()
            })
        }
    }, [])

    return <div className='grid grid-cols-1 grid-rows-3 h-screen overflow-hidden'>
        <div className='grid grid-cols-12 row-span-2 w-full'>
            <div className='col-span-2 overflow-y-scroll'>
                <Files onSelect={(path) => setSelectedFile(path)} tree={fileTree} />
            </div>
            <div className='col-span-10 overflow-y-scroll w-full'>
                {selectedFile && <h1>{selectedFile.replaceAll("/", " > ").replaceAll(".", "")}</h1>} {isSaved ? <span className='text-green-500'>Saved</span> : <span className='text-red-500'>Unsaved</span>}
                <AceEditor
                    value={code}
                    onChange={(value) => setCode(value)}
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                />
            </div>
        </div>
        <div className='w-full row-span-1'>
            <Terminal />
        </div>
    </div>
}

export default App
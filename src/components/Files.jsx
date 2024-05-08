import React from 'react'

const FileNode = ({ fileName, nodes, onSelect, path }) => {
    const isDir = !!nodes

    return <div onClick={e => {
        e.stopPropagation()
        if (isDir) return;
        onSelect(path)
    }}>
        {fileName}
        {
            nodes && <ul style={{
                marginLeft: '20px'
            }}>
                {
                    Object.keys(nodes).map(child => {
                        return <li key={child}>
                            <FileNode path={path + '/' + child} fileName={child} nodes={nodes[child]} onSelect={onSelect} />
                        </li>
                    })
                }
            </ul>
        }
    </div>
}

const Files = ({ tree, onSelect }) => {
    return <FileNode fileName='/' onSelect={onSelect} path={'.'} nodes={tree} />
}

export default Files
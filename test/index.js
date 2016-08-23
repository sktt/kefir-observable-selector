require.requireActual('mutationobserver-shim')
const {obsAdded, obsRemoved, obsAttributes} = require.requireActual('../index')

function* addTestNode() {
  let i = 0
  while(true) {
    let n = document.createElement('div')
    n.id = `added-${++i}`
    yield n
  }
}

describe('test', () => {

  let root = null
  let addNode = null

  beforeEach(() => {
    const newRoot = document.createElement('div')
    newRoot.id = 'root'
    if(root) {
      document.body.replaceChild(newRoot, root)
    } else {
      document.body.appendChild(newRoot)
    }
    root = newRoot
    addNode = addTestNode()
  })

  pit('observes added + existing nodes in root', () => new Promise(resolve => {
    const n = addNode.next().value
    root.appendChild(n)

    // subtree should not not be checked
    n.appendChild(addNode.next().value)

    // listen to added nodes with selector 'div' in document.body
    // include subtree.
    obsAdded(root, '[id^=added]').bufferWithCount(2).take(1).onValue(resolve)

    setTimeout(() => {
      root.innerHTML = '<div id="added-3"></div>'
    }, 50)

    // MutationObserver-shim, run two checks
    jest.runOnlyPendingTimers()
    jest.runOnlyPendingTimers()
  }).then((buffer) => {
    expect(buffer.length).toBe(2) // initial + added
    expect(buffer.reduce((acc, nodes) => acc + nodes.length, 0), 2)
    expect(buffer[0][0].id).toBe('added-1')
    expect(buffer[1][0].id).toBe('added-3')
  }))

  pit('observes added + existing nodes in root and subtree', () => new Promise(resolve => {
    const n = addNode.next().value
    root.appendChild(n)

    n.appendChild(addNode.next().value)

    // listen to added nodes with selector 'div' in document.body
    // include subtree.
    obsAdded(root, '[id^=added]', true).bufferWithCount(3).take(1).onValue(resolve)

    root.appendChild(addNode.next().value)

    setTimeout(() => {
      root.innerHTML = '<div id="added-4"></div>'
    }, 50)

    // MutationObserver-shim, run two checks
    jest.runOnlyPendingTimers()
    jest.runOnlyPendingTimers()
  }).then((buffer) => {
    expect(buffer.length).toBe(3) // initial + added + added
    expect(buffer.reduce((acc, nodes) => acc + nodes.length, 0), 4)
    expect(buffer[0][0].id).toBe('added-1')
    expect(buffer[0][1].id).toBe('added-2')
    expect(buffer[1][0].id).toBe('added-3')
    expect(buffer[2][0].id).toBe('added-4')
  }))

  pit('observes removed nodes', () => new Promise(resolve => {
    const n = addNode.next().value
    root.appendChild(n)
    n.appendChild(addNode.next().value)

    obsRemoved(root, '[id^=added]').onValue(resolve)

    root.removeChild(n)
    jest.runOnlyPendingTimers()
    jest.runOnlyPendingTimers()
  }).then(nodes => {
    expect(nodes.length).toBe(1)
    expect(nodes[0].id).toBe('added-1')
  }))

  pit('observes removed nodes + subtree', () => new Promise(resolve => {
    const n1 = addNode.next().value
    root.appendChild(n1)
    n1.appendChild(addNode.next().value)

    const n2 = addNode.next().value
    root.appendChild(n2)

    const removedStream = obsRemoved(root, '[id^=added]', true).bufferWithCount(2).onValue(resolve)

    root.removeChild(n2)
    setTimeout(() => {
      root.removeChild(n1)
    }, 50)

    jest.runOnlyPendingTimers()
    jest.runOnlyPendingTimers()
  }).then(buffer => {
    expect(buffer.length).toBe(2)
    expect(buffer.reduce((acc, nodes) => acc + nodes.length, 0)).toBe(3)
    expect(buffer[0].length).toBe(1)
    expect(buffer[1].length).toBe(2)
    expect(buffer[0][0].id).toBe('added-3')
    expect(buffer[1][0].id).toBe('added-1')
    expect(buffer[1][1].id).toBe('added-2')
  }))

  pit('observes node attribute changes', () => new Promise(resolve => {
    obsAttributes(root, ['class']).onValue(resolve)
    setTimeout(_ => {
      root.className = 'new'
    }, 100)
    setTimeout(_ => {
      root.dataset = {test: 'nope'}
    }, 50)
    jest.runOnlyPendingTimers()
    jest.runOnlyPendingTimers()
  }).then(node => {
    expect(node.id).toBe('root')
    expect(node.className).toBe('new')
  }))
})


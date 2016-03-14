import {fromEvents, constant, stream} from 'kefir'

const domReady = constant(document.readyState)
  .filter(state => state === 'complete')
  .merge(fromEvents(document, 'DOMContentLoaded').map(_ => document.readyState))
  .take(1)
  .toProperty()

const mutationRecorder = (root, options) => domReady.flatMap(
  _ => stream(
    emitter => {
      const obs = new MutationObserver(emitter.emit)

      //NOTE: At the very least, childList, attributes, or characterData
      //must be set to true. Otherwise, "An invalid or illegal string was
      //specified" error is thrown.
      obs.observe(root, options)
      return () => obs.disconnect()
    }
  )
)

const exists = e => e != null

const populated = e => e && Object.keys(e).length

const matches = selector => el => el.matches && el.matches(selector)

const pluck = key => arr => arr.map(el => el[key])

const filterReducer = filterFunc => (acc, n) => {
  if(filterFunc(n)) {
    return acc.concat(n)
  }
  return acc
}

const nodesMatching = selector => nodeArrs => nodeArrs.reduce(filterReducer(
  nodes => Array.prototype.concat.apply([], nodes).filter(matches(selector))
), [])

const includeNested = selector => matches => {
  const m = matches.reduce(
    (acc, node) => acc.concat.apply([], node.querySelectorAll(selector)), []
  )
  return matches.concat(m)
}

const obsAdded = (root, selector, subtree) => {
  return mutationRecorder(root, {
    childList: true,
    subtree
  })
  .map(pluck('addedNodes'))
  .map(nodesMatching(selector))
  .merge(constant(Array.prototype.concat.apply([],
    document.querySelectorAll(selector)
  )))
  .filter(populated)
  .map(subtree ? includeNested(selector) : (nodes) => nodes)
}

const obsRemoved = (root, selector, subtree) => {
  return mutationRecorder(root, {
    childList: true,
    subtree
  })
  .map(pluck('removedNodes'))
  .map(nodesMatching(selector))
  .filter(populated)
  .map(subtree ? includeNested(selector) : (nodes) => nodes)
}

const obsAttributes = (root, attributeFilter) => {
  return mutationRecorder(root, {
    attributes: true,
    attributeFilter
  })
  .map(pluck('target'))
  .map(nodes => nodes.reduce(
    filterReducer(n => n === root), []
  ))
  // only looking at one node
  .map(el => el[0])
}

export default {
  obsAdded, obsRemoved, obsAttributes, domReady
}

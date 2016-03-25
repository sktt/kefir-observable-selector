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

const noop = x => x

const concat = (acc, n) => acc.concat(n)

const nodesMatching = selector => nodes => nodes.filter(matches(selector))

const toArray = collection => Array.prototype.concat.apply([], collection)

const flattenArrays = nodeArrs => nodeArrs.map(toArray).reduce(concat, [])

const includeNested = selector => nodes => {
  const m = nodes.filter(
    // only include nodes
    node => node.nodeType === 1
  ).map(
    node => toArray(node.querySelectorAll(selector))
  ).reduce(concat, [])

  return nodes.concat(m)
}

export const obsAdded = (root, selector, subtree) => {
  return mutationRecorder(root, {
    childList: true,
    subtree
  })
  .map(pluck('addedNodes'))
  .map(flattenArrays)
  .map(subtree ? includeNested(selector) : noop)
  .map(nodesMatching(selector))
  .merge(constant(Array.prototype.concat.apply([],
    document.querySelectorAll(selector)
  )))
  .filter(populated)
}

export const obsRemoved = (root, selector, subtree) => {
  return mutationRecorder(root, {
    childList: true,
    subtree
  })
  .map(pluck('removedNodes'))
  .map(flattenArrays)
  .map(subtree ? includeNested(selector) : noop)
  .map(nodesMatching(selector))
  .filter(populated)
}

export const obsAttributes = (root, attributeFilter) => {
  return mutationRecorder(root, {
    attributes: true,
    attributeFilter
  })
  .map(pluck('target'))
  .map(nodes => nodes.filter(n => n === root))
  .map(nodes => nodes.reduce(concat, []))
  // only looking at one node
  .map(el => el[0])
}

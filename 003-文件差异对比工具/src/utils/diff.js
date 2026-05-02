export function diffLines(oldText, newText) {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  
  const m = oldLines.length
  const n = newLines.length
  
  if (m === 0 && n === 0) return []
  
  const dp = []
  for (let i = 0; i <= m; i++) {
    dp[i] = []
    for (let j = 0; j <= n; j++) {
      dp[i][j] = 0
    }
  }
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  
  const lcs = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      lcs.unshift({ oldIndex: i - 1, newIndex: j - 1, line: oldLines[i - 1] })
      i--
      j--
    } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
      i--
    } else {
      j--
    }
  }
  
  const lcsSet = new Set(lcs.map(item => `${item.oldIndex}-${item.newIndex}`))
  
  const result = []
  let oldIdx = 0, newIdx = 0
  let lcsIdx = 0
  
  while (oldIdx < m || newIdx < n) {
    if (lcsIdx < lcs.length && oldIdx === lcs[lcsIdx].oldIndex && newIdx === lcs[lcsIdx].newIndex) {
      result.push({
        type: 'equal',
        oldLine: oldLines[oldIdx],
        newLine: newLines[newIdx],
        oldIndex: oldIdx,
        newIndex: newIdx
      })
      oldIdx++
      newIdx++
      lcsIdx++
    } else if (oldIdx < m && !containsLCS(oldIdx, newIdx, lcs, lcsIdx)) {
      if (newIdx < n && newIdx < getNextNewIndex(lcs, lcsIdx)) {
        result.push({
          type: 'insert',
          newLine: newLines[newIdx],
          newIndex: newIdx
        })
        newIdx++
      } else {
        result.push({
          type: 'delete',
          oldLine: oldLines[oldIdx],
          oldIndex: oldIdx
        })
        oldIdx++
      }
    } else if (newIdx < n) {
      result.push({
        type: 'insert',
        newLine: newLines[newIdx],
        newIndex: newIdx
      })
      newIdx++
    } else {
      result.push({
        type: 'delete',
        oldLine: oldLines[oldIdx],
        oldIndex: oldIdx
      })
      oldIdx++
    }
  }
  
  return identifyModifications(result)
}

function containsLCS(oldIdx, newIdx, lcs, lcsIdx) {
  for (let k = lcsIdx; k < lcs.length; k++) {
    if (lcs[k].oldIndex === oldIdx && lcs[k].newIndex === newIdx) {
      return true
    }
    if (lcs[k].oldIndex > oldIdx || lcs[k].newIndex > newIdx) {
      break
    }
  }
  return false
}

function getNextNewIndex(lcs, lcsIdx) {
  if (lcsIdx < lcs.length) {
    return lcs[lcsIdx].newIndex
  }
  return Infinity
}

function identifyModifications(diff) {
  const result = []
  let i = 0
  
  while (i < diff.length) {
    if (i < diff.length - 1 && 
        diff[i].type === 'delete' && 
        diff[i + 1].type === 'insert') {
      const oldIdx = diff[i].oldIndex
      const newIdx = diff[i + 1].newIndex
      const oldLine = diff[i].oldLine
      const newLine = diff[i + 1].newLine
      
      const positionsMatch = oldIdx === newIdx || 
                            Math.abs(diff[i].oldIndex - diff[i + 1].newIndex) <= 1
      
      const contentSimilar = calculateLineSimilarity(oldLine, newLine) > 0.4
      
      if (positionsMatch && contentSimilar) {
        result.push({
          type: 'modify',
          oldLine: oldLine,
          newLine: newLine,
          oldIndex: oldIdx,
          newIndex: newIdx,
          oldCharDiff: diffChars(oldLine, newLine),
          newCharDiff: diffChars(oldLine, newLine)
        })
        i += 2
        continue
      }
    }
    
    result.push(diff[i])
    i++
  }
  
  return result
}

function calculateLineSimilarity(str1, str2) {
  if (!str1 || !str2) return 0
  if (str1 === str2) return 1
  
  const len1 = str1.length
  const len2 = str2.length
  const maxLen = Math.max(len1, len2)
  if (maxLen === 0) return 1
  
  let matches = 0
  const minLen = Math.min(len1, len2)
  for (let i = 0; i < minLen; i++) {
    if (str1[i] === str2[i]) matches++
  }
  
  for (let i = minLen; i < len1; i++) {
    if (str2.includes(str1[i])) matches++
  }
  for (let i = minLen; i < len2; i++) {
    if (str1.includes(str2[i])) matches++
  }
  
  return matches / maxLen
}

export function diffChars(oldStr, newStr) {
  if (!oldStr && !newStr) return []
  if (!oldStr) return [{ type: 'insert', value: newStr }]
  if (!newStr) return [{ type: 'delete', value: oldStr }]
  if (oldStr === newStr) return [{ type: 'equal', value: oldStr }]
  
  const oldChars = oldStr.split('')
  const newChars = newStr.split('')
  
  const m = oldChars.length
  const n = newChars.length
  const max = m + n
  const v = {}
  const trace = []
  
  v[1] = 0
  
  for (let d = 0; d <= max; d++) {
    trace[d] = { ...v }
    
    for (let k = -d; k <= d; k += 2) {
      let x
      if (k === -d || (k !== d && v[k - 1] < v[k + 1])) {
        x = v[k + 1]
      } else {
        x = v[k - 1] + 1
      }
      
      let y = x - k
      
      while (x < m && y < n && oldChars[x] === newChars[y]) {
        x++
        y++
      }
      
      v[k] = x
      
      if (x >= m && y >= n) {
        return backtrackChars(trace, oldChars, newChars, m, n)
      }
    }
  }
  
  return []
}

function backtrackChars(trace, oldChars, newChars, m, n) {
  const diff = []
  let x = m
  let y = n
  
  for (let d = trace.length - 1; d >= 0; d--) {
    const v = trace[d]
    const k = x - y
    
    let prevK
    if (k === -d || (k !== d && v[k - 1] < v[k + 1])) {
      prevK = k + 1
    } else {
      prevK = k - 1
    }
    
    const prevX = v[prevK]
    const prevY = prevX - prevK
    
    while (x > prevX && y > prevY) {
      diff.unshift({ type: 'equal', value: oldChars[x - 1] })
      x--
      y--
    }
    
    if (d > 0) {
      if (x > prevX) {
        diff.unshift({ type: 'delete', value: oldChars[x - 1] })
        x--
      } else if (y > prevY) {
        diff.unshift({ type: 'insert', value: newChars[y - 1] })
        y--
      }
    }
  }
  
  return diff
}

export function calculateStats(diff) {
  let inserts = 0
  let deletes = 0
  let modifies = 0
  let equals = 0
  
  for (const item of diff) {
    if (item.type === 'insert') inserts++
    else if (item.type === 'delete') deletes++
    else if (item.type === 'modify') modifies++
    else equals++
  }
  
  const changes = inserts + deletes + modifies
  
  return { 
    inserts, 
    deletes, 
    modifies,
    equals, 
    total: diff.length,
    changes
  }
}

export function mergeDiffBlocks(diff) {
  const blocks = []
  let currentBlock = null
  
  for (const item of diff) {
    if (!currentBlock || currentBlock.type !== item.type) {
      if (currentBlock) {
        blocks.push(currentBlock)
      }
      currentBlock = { type: item.type, items: [item] }
    } else {
      currentBlock.items.push(item)
    }
  }
  
  if (currentBlock) {
    blocks.push(currentBlock)
  }
  
  return blocks
}

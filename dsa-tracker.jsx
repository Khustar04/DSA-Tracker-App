import { useState, useEffect } from "react";

const DSA_DATA = [
  {
    month: 1, title: "Arrays, Strings, Math & Recursion", color: "#00ff88", weeks: [
      { week: 1, title: "Arrays Basics", problems: [
        { id: "1-1", name: "Two Sum", diff: "Easy", lc: "#1" },
        { id: "1-2", name: "Best Time to Buy and Sell Stock", diff: "Easy", lc: "#121" },
        { id: "1-3", name: "Contains Duplicate", diff: "Easy", lc: "#217" },
        { id: "1-4", name: "Maximum Subarray (Kadane's)", diff: "Medium", lc: "#53" },
        { id: "1-5", name: "Product of Array Except Self", diff: "Medium", lc: "#238" },
        { id: "1-6", name: "Maximum Product Subarray", diff: "Medium", lc: "#152" },
        { id: "1-7", name: "Find Minimum in Rotated Sorted Array", diff: "Medium", lc: "#153" },
      ]},
      { week: 2, title: "Arrays Advanced", problems: [
        { id: "1-8", name: "Search in Rotated Sorted Array", diff: "Medium", lc: "#33" },
        { id: "1-9", name: "3Sum", diff: "Medium", lc: "#15" },
        { id: "1-10", name: "Container With Most Water", diff: "Medium", lc: "#11" },
        { id: "1-11", name: "Move Zeroes", diff: "Easy", lc: "#283" },
        { id: "1-12", name: "Missing Number", diff: "Easy", lc: "#268" },
        { id: "1-13", name: "Single Number", diff: "Easy", lc: "#136" },
        { id: "1-14", name: "Majority Element", diff: "Easy", lc: "#169" },
        { id: "1-15", name: "Rotate Array", diff: "Medium", lc: "#189" },
      ]},
      { week: 3, title: "Strings", problems: [
        { id: "1-16", name: "Valid Palindrome", diff: "Easy", lc: "#125" },
        { id: "1-17", name: "Reverse String", diff: "Easy", lc: "#344" },
        { id: "1-18", name: "Valid Anagram", diff: "Easy", lc: "#242" },
        { id: "1-19", name: "First Unique Character", diff: "Easy", lc: "#387" },
        { id: "1-20", name: "Longest Common Prefix", diff: "Easy", lc: "#14" },
        { id: "1-21", name: "Reverse Words in a String", diff: "Medium", lc: "#151" },
        { id: "1-22", name: "Longest Substring Without Repeating", diff: "Medium", lc: "#3" },
        { id: "1-23", name: "Group Anagrams", diff: "Medium", lc: "#49" },
      ]},
      { week: 4, title: "Math + Recursion", problems: [
        { id: "1-24", name: "Fizz Buzz", diff: "Easy", lc: "#412" },
        { id: "1-25", name: "Power of Two", diff: "Easy", lc: "#231" },
        { id: "1-26", name: "Palindrome Number", diff: "Easy", lc: "#9" },
        { id: "1-27", name: "Reverse Integer", diff: "Medium", lc: "#7" },
        { id: "1-28", name: "Climbing Stairs", diff: "Easy", lc: "#70" },
        { id: "1-29", name: "Fibonacci Number", diff: "Easy", lc: "#509" },
        { id: "1-30", name: "Power(x, n)", diff: "Medium", lc: "#50" },
      ]},
    ]
  },
  {
    month: 2, title: "Sorting, Binary Search & Hashing", color: "#00ccff", weeks: [
      { week: 5, title: "Sorting", problems: [
        { id: "2-1", name: "Sort Colors (Dutch Flag)", diff: "Medium", lc: "#75" },
        { id: "2-2", name: "Merge Intervals", diff: "Medium", lc: "#56" },
        { id: "2-3", name: "Insert Interval", diff: "Medium", lc: "#57" },
        { id: "2-4", name: "Largest Number", diff: "Medium", lc: "#179" },
        { id: "2-5", name: "Kth Largest Element in Array", diff: "Medium", lc: "#215" },
        { id: "2-6", name: "Meeting Rooms", diff: "Easy", lc: "#252" },
      ]},
      { week: 6, title: "Binary Search", problems: [
        { id: "2-7", name: "Binary Search", diff: "Easy", lc: "#704" },
        { id: "2-8", name: "First Bad Version", diff: "Easy", lc: "#278" },
        { id: "2-9", name: "Search Insert Position", diff: "Easy", lc: "#35" },
        { id: "2-10", name: "Find First and Last Position", diff: "Medium", lc: "#34" },
        { id: "2-11", name: "Search a 2D Matrix", diff: "Medium", lc: "#74" },
        { id: "2-12", name: "Find Peak Element", diff: "Medium", lc: "#162" },
        { id: "2-13", name: "Koko Eating Bananas", diff: "Medium", lc: "#875" },
      ]},
      { week: 7, title: "Hashing", problems: [
        { id: "2-14", name: "Happy Number", diff: "Easy", lc: "#202" },
        { id: "2-15", name: "Isomorphic Strings", diff: "Easy", lc: "#205" },
        { id: "2-16", name: "Word Pattern", diff: "Easy", lc: "#290" },
        { id: "2-17", name: "Subarray Sum Equals K", diff: "Medium", lc: "#560" },
        { id: "2-18", name: "Longest Consecutive Sequence", diff: "Medium", lc: "#128" },
        { id: "2-19", name: "Top K Frequent Elements", diff: "Medium", lc: "#347" },
      ]},
    ]
  },
  {
    month: 3, title: "Linked List, Stack & Queue", color: "#ff9900", weeks: [
      { week: 9, title: "Linked List Basics", problems: [
        { id: "3-1", name: "Reverse Linked List", diff: "Easy", lc: "#206" },
        { id: "3-2", name: "Merge Two Sorted Lists", diff: "Easy", lc: "#21" },
        { id: "3-3", name: "Linked List Cycle", diff: "Easy", lc: "#141" },
        { id: "3-4", name: "Middle of Linked List", diff: "Easy", lc: "#876" },
        { id: "3-5", name: "Remove Nth Node From End", diff: "Medium", lc: "#19" },
        { id: "3-6", name: "Reorder List", diff: "Medium", lc: "#143" },
        { id: "3-7", name: "Add Two Numbers", diff: "Medium", lc: "#2" },
      ]},
      { week: 10, title: "Linked List Advanced", problems: [
        { id: "3-8", name: "Copy List with Random Pointer", diff: "Medium", lc: "#138" },
        { id: "3-9", name: "Sort List", diff: "Medium", lc: "#148" },
        { id: "3-10", name: "Linked List Cycle II", diff: "Medium", lc: "#142" },
        { id: "3-11", name: "LRU Cache", diff: "Medium", lc: "#146" },
        { id: "3-12", name: "Flatten Multilevel Doubly LL", diff: "Medium", lc: "#430" },
      ]},
      { week: 11, title: "Stack", problems: [
        { id: "3-13", name: "Valid Parentheses", diff: "Easy", lc: "#20" },
        { id: "3-14", name: "Min Stack", diff: "Medium", lc: "#155" },
        { id: "3-15", name: "Evaluate Reverse Polish Notation", diff: "Medium", lc: "#150" },
        { id: "3-16", name: "Daily Temperatures", diff: "Medium", lc: "#739" },
        { id: "3-17", name: "Next Greater Element I", diff: "Easy", lc: "#496" },
        { id: "3-18", name: "Next Greater Element II", diff: "Medium", lc: "#503" },
        { id: "3-19", name: "Largest Rectangle in Histogram", diff: "Hard", lc: "#84" },
      ]},
      { week: 12, title: "Queue + Deque", problems: [
        { id: "3-20", name: "Implement Queue using Stacks", diff: "Easy", lc: "#232" },
        { id: "3-21", name: "Implement Stack using Queues", diff: "Easy", lc: "#225" },
        { id: "3-22", name: "Sliding Window Maximum", diff: "Hard", lc: "#239" },
        { id: "3-23", name: "Design Circular Queue", diff: "Medium", lc: "#622" },
      ]},
    ]
  },
  {
    month: 4, title: "Trees & Heap", color: "#ff4488", weeks: [
      { week: 13, title: "Binary Tree Basics", problems: [
        { id: "4-1", name: "Inorder Traversal", diff: "Easy", lc: "#94" },
        { id: "4-2", name: "Binary Tree Level Order Traversal", diff: "Medium", lc: "#102" },
        { id: "4-3", name: "Maximum Depth of Binary Tree", diff: "Easy", lc: "#104" },
        { id: "4-4", name: "Symmetric Tree", diff: "Easy", lc: "#101" },
        { id: "4-5", name: "Path Sum", diff: "Easy", lc: "#112" },
        { id: "4-6", name: "Invert Binary Tree", diff: "Easy", lc: "#226" },
        { id: "4-7", name: "Diameter of Binary Tree", diff: "Easy", lc: "#543" },
      ]},
      { week: 14, title: "Binary Tree Advanced", problems: [
        { id: "4-8", name: "Binary Tree Right Side View", diff: "Medium", lc: "#199" },
        { id: "4-9", name: "Lowest Common Ancestor", diff: "Medium", lc: "#236" },
        { id: "4-10", name: "Binary Tree Zigzag Level Order", diff: "Medium", lc: "#103" },
        { id: "4-11", name: "Flatten Binary Tree to Linked List", diff: "Medium", lc: "#114" },
        { id: "4-12", name: "Count Good Nodes in Binary Tree", diff: "Medium", lc: "#1448" },
      ]},
      { week: 15, title: "BST", problems: [
        { id: "4-13", name: "Validate Binary Search Tree", diff: "Medium", lc: "#98" },
        { id: "4-14", name: "Kth Smallest Element in BST", diff: "Medium", lc: "#230" },
        { id: "4-15", name: "LCA of BST", diff: "Medium", lc: "#235" },
        { id: "4-16", name: "Insert into a BST", diff: "Medium", lc: "#701" },
        { id: "4-17", name: "Convert Sorted Array to BST", diff: "Easy", lc: "#108" },
      ]},
      { week: 16, title: "Heap / Priority Queue", problems: [
        { id: "4-18", name: "Kth Largest Element in Stream", diff: "Easy", lc: "#703" },
        { id: "4-19", name: "Last Stone Weight", diff: "Easy", lc: "#1046" },
        { id: "4-20", name: "K Closest Points to Origin", diff: "Medium", lc: "#973" },
        { id: "4-21", name: "Task Scheduler", diff: "Medium", lc: "#621" },
        { id: "4-22", name: "Find Median from Data Stream", diff: "Hard", lc: "#295" },
      ]},
    ]
  },
  {
    month: 5, title: "Graphs, Greedy & Sliding Window", color: "#aa44ff", weeks: [
      { week: 17, title: "Graph Basics", problems: [
        { id: "5-1", name: "Number of Islands", diff: "Medium", lc: "#200" },
        { id: "5-2", name: "Clone Graph", diff: "Medium", lc: "#133" },
        { id: "5-3", name: "Max Area of Island", diff: "Medium", lc: "#695" },
        { id: "5-4", name: "Pacific Atlantic Water Flow", diff: "Medium", lc: "#417" },
        { id: "5-5", name: "Rotting Oranges", diff: "Medium", lc: "#994" },
      ]},
      { week: 18, title: "Graph Advanced", problems: [
        { id: "5-6", name: "Course Schedule (Topo Sort)", diff: "Medium", lc: "#207" },
        { id: "5-7", name: "Course Schedule II", diff: "Medium", lc: "#210" },
        { id: "5-8", name: "Word Ladder", diff: "Hard", lc: "#127" },
        { id: "5-9", name: "Network Delay Time (Dijkstra)", diff: "Medium", lc: "#743" },
        { id: "5-10", name: "Cheapest Flights Within K Stops", diff: "Medium", lc: "#787" },
      ]},
      { week: 19, title: "Greedy", problems: [
        { id: "5-11", name: "Jump Game", diff: "Medium", lc: "#55" },
        { id: "5-12", name: "Jump Game II", diff: "Medium", lc: "#45" },
        { id: "5-13", name: "Gas Station", diff: "Medium", lc: "#134" },
        { id: "5-14", name: "Non-overlapping Intervals", diff: "Medium", lc: "#435" },
        { id: "5-15", name: "Partition Labels", diff: "Medium", lc: "#763" },
      ]},
      { week: 20, title: "Sliding Window Advanced", problems: [
        { id: "5-16", name: "Minimum Size Subarray Sum", diff: "Medium", lc: "#209" },
        { id: "5-17", name: "Permutation in String", diff: "Medium", lc: "#567" },
        { id: "5-18", name: "Minimum Window Substring", diff: "Hard", lc: "#76" },
      ]},
    ]
  },
  {
    month: 6, title: "Dynamic Programming + Revision", color: "#ffdd00", weeks: [
      { week: 21, title: "DP Basics", problems: [
        { id: "6-1", name: "Climbing Stairs (DP)", diff: "Easy", lc: "#70" },
        { id: "6-2", name: "House Robber", diff: "Medium", lc: "#198" },
        { id: "6-3", name: "House Robber II", diff: "Medium", lc: "#213" },
        { id: "6-4", name: "Longest Palindromic Substring", diff: "Medium", lc: "#5" },
        { id: "6-5", name: "Decode Ways", diff: "Medium", lc: "#91" },
        { id: "6-6", name: "Coin Change", diff: "Medium", lc: "#322" },
        { id: "6-7", name: "Word Break", diff: "Medium", lc: "#139" },
        { id: "6-8", name: "Unique Paths", diff: "Medium", lc: "#62" },
      ]},
      { week: 22, title: "DP Advanced", problems: [
        { id: "6-9", name: "Longest Common Subsequence", diff: "Medium", lc: "#1143" },
        { id: "6-10", name: "Edit Distance", diff: "Hard", lc: "#72" },
        { id: "6-11", name: "Longest Increasing Subsequence", diff: "Medium", lc: "#300" },
        { id: "6-12", name: "Combination Sum IV", diff: "Medium", lc: "#377" },
        { id: "6-13", name: "Palindromic Substrings", diff: "Medium", lc: "#647" },
        { id: "6-14", name: "Maximum Product Subarray", diff: "Medium", lc: "#152" },
        { id: "6-15", name: "0/1 Knapsack", diff: "Medium", lc: "GFG" },
      ]},
    ]
  },
];

const DIFF_STYLE = {
  Easy: { color: "#00ff88", bg: "rgba(0,255,136,0.1)" },
  Medium: { color: "#ffaa00", bg: "rgba(255,170,0,0.1)" },
  Hard: { color: "#ff4455", bg: "rgba(255,68,85,0.1)" },
};

const TOTAL_PROBLEMS = DSA_DATA.reduce((acc, m) =>
  acc + m.weeks.reduce((a, w) => a + w.problems.length, 0), 0);

export default function DSATracker() {
  const [solved, setSolved] = useState({});
  const [activeMonth, setActiveMonth] = useState(1);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await window.storage.get("dsa-solved");
        if (res?.value) setSolved(JSON.parse(res.value));
      } catch {}
      setLoaded(true);
    };
    load();
  }, []);

  const toggleSolved = async (id) => {
    const next = { ...solved, [id]: !solved[id] };
    if (!next[id]) delete next[id];
    setSolved(next);
    try { await window.storage.set("dsa-solved", JSON.stringify(next)); } catch {}
  };

  const toggleWeek = (key) => setExpandedWeeks(p => ({ ...p, [key]: !p[key] }));

  const solvedCount = Object.values(solved).filter(Boolean).length;
  const pct = Math.round((solvedCount / TOTAL_PROBLEMS) * 100);

  const monthSolved = (m) => m.weeks.reduce((a, w) =>
    a + w.problems.filter(p => solved[p.id]).length, 0);
  const monthTotal = (m) => m.weeks.reduce((a, w) => a + w.problems.length, 0);

  const activeMonthData = DSA_DATA.find(m => m.month === activeMonth);

  if (!loaded) return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#00ff88", fontFamily: "monospace", fontSize: 20 }}>Loading tracker...</div>
    </div>
  );

  return (
    <div style={{
      background: "#0a0a0f",
      minHeight: "100vh",
      fontFamily: "'Courier New', monospace",
      color: "#e0e0e0",
      padding: "0 0 60px 0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0d1117 0%, #111827 100%)",
        borderBottom: "1px solid #1a2a1a",
        padding: "28px 24px 20px",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#00ff88", letterSpacing: 3, marginBottom: 4 }}>KHUSTAR'S</div>
              <div style={{ fontSize: 22, fontWeight: "bold", color: "#fff", lineHeight: 1.2 }}>DSA PROGRESS TRACKER</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>6 Month Java DSA Journey 🚀</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 32, fontWeight: "bold", color: "#00ff88" }}>{pct}%</div>
              <div style={{ fontSize: 11, color: "#555" }}>{solvedCount} / {TOTAL_PROBLEMS} solved</div>
            </div>
          </div>
          {/* Global Progress Bar */}
          <div style={{ marginTop: 16, background: "#1a1a2a", borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{
              width: `${pct}%`, height: "100%", borderRadius: 99,
              background: "linear-gradient(90deg, #00ff88, #00ccff)",
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px 0" }}>
        {/* Month Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
          {DSA_DATA.map(m => {
            const ms = monthSolved(m), mt = monthTotal(m);
            const mp = Math.round((ms / mt) * 100);
            return (
              <div key={m.month} onClick={() => setActiveMonth(m.month)} style={{
                background: activeMonth === m.month ? `${m.color}15` : "#111",
                border: `1px solid ${activeMonth === m.month ? m.color : "#222"}`,
                borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 10, color: m.color, letterSpacing: 1, marginBottom: 2 }}>MONTH {m.month}</div>
                <div style={{ fontSize: 12, color: "#ccc", marginBottom: 8, lineHeight: 1.3 }}>
                  {m.title.split(",")[0]}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: "#555" }}>{ms}/{mt}</span>
                  <span style={{ fontSize: 11, color: m.color, fontWeight: "bold" }}>{mp}%</span>
                </div>
                <div style={{ background: "#1a1a2a", borderRadius: 99, height: 4 }}>
                  <div style={{ width: `${mp}%`, height: "100%", borderRadius: 99, background: m.color, transition: "width 0.3s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Month Details */}
        {activeMonthData && (
          <div>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 16, paddingBottom: 12,
              borderBottom: `1px solid ${activeMonthData.color}33`
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: `${activeMonthData.color}20`,
                border: `1px solid ${activeMonthData.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: "bold", color: activeMonthData.color
              }}>{activeMonth}</div>
              <div>
                <div style={{ fontSize: 15, color: "#fff", fontWeight: "bold" }}>{activeMonthData.title}</div>
                <div style={{ fontSize: 11, color: "#555" }}>
                  {monthSolved(activeMonthData)} of {monthTotal(activeMonthData)} completed
                </div>
              </div>
            </div>

            {activeMonthData.weeks.map(week => {
              const wkey = `${activeMonth}-${week.week}`;
              const wsolved = week.problems.filter(p => solved[p.id]).length;
              const isOpen = expandedWeeks[wkey] !== false;
              return (
                <div key={wkey} style={{ marginBottom: 12 }}>
                  <div onClick={() => toggleWeek(wkey)} style={{
                    background: "#111",
                    border: "1px solid #1e1e2e",
                    borderRadius: 10, padding: "12px 16px",
                    cursor: "pointer", display: "flex",
                    justifyContent: "space-between", alignItems: "center",
                    userSelect: "none",
                  }}>
                    <div>
                      <span style={{ fontSize: 10, color: activeMonthData.color, marginRight: 8 }}>
                        WEEK {week.week}
                      </span>
                      <span style={{ fontSize: 13, color: "#ddd" }}>{week.title}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        fontSize: 11, fontWeight: "bold",
                        color: wsolved === week.problems.length ? "#00ff88" : "#555"
                      }}>
                        {wsolved}/{week.problems.length}
                      </span>
                      <span style={{ color: "#444", fontSize: 14 }}>{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ borderLeft: `2px solid ${activeMonthData.color}33`, marginLeft: 16, paddingLeft: 12 }}>
                      {week.problems.map((p, i) => {
                        const done = !!solved[p.id];
                        const ds = DIFF_STYLE[p.diff];
                        return (
                          <div key={p.id} onClick={() => toggleSolved(p.id)} style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "10px 12px",
                            background: done ? "#0d1f0d" : i % 2 === 0 ? "#0d0d12" : "#0a0a0f",
                            borderBottom: "1px solid #111",
                            cursor: "pointer", transition: "background 0.15s",
                            borderRadius: i === 0 ? "0 8px 0 0" : i === week.problems.length - 1 ? "0 0 8px 0" : 0,
                          }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                              border: `1.5px solid ${done ? "#00ff88" : "#333"}`,
                              background: done ? "#00ff8822" : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, color: "#00ff88",
                            }}>
                              {done ? "✓" : ""}
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{
                                fontSize: 13, color: done ? "#555" : "#ddd",
                                textDecoration: done ? "line-through" : "none",
                              }}>{p.name}</span>
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={{
                                fontSize: 10, padding: "2px 7px", borderRadius: 99,
                                color: ds.color, background: ds.bg, border: `1px solid ${ds.color}33`
                              }}>{p.diff}</span>
                              <span style={{ fontSize: 10, color: "#333", minWidth: 30 }}>{p.lc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 32, textAlign: "center", fontSize: 11, color: "#2a2a3a",
          borderTop: "1px solid #111", paddingTop: 20
        }}>
          Progress auto-saved • Tap problems to mark solved ✓
        </div>
      </div>
    </div>
  );
}

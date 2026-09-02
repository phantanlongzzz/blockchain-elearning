const fs = require('fs');

let content = fs.readFileSync('src/components/ProofOfWork/PowLesson.tsx', 'utf8');

// 1. Add focusedBlockIndex state
content = content.replace(
  `const [justAddedBlockIndex, setJustAddedBlockIndex] = useState<number | null>(null);`,
  `const [justAddedBlockIndex, setJustAddedBlockIndex] = useState<number | null>(null);
  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number>(0);`
);

// 2. Add navigation functions and update handleTimelineScroll
const scrollFunctionStart = content.indexOf('const handleTimelineScroll = useCallback(() => {');
const scrollFunctionEnd = content.indexOf('  // Event-based smart camera: Auto-scroll blockchain timeline to newly mined / leading block');

const newScrollLogic = `
  const navigateTimeline = useCallback((direction: 'prev' | 'next') => {
    setBlockchain(prevBlockchain => {
      setFocusedBlockIndex(prevIdx => {
        const total = prevBlockchain.length;
        if (total === 0) return prevIdx;
        
        let newIndex = prevIdx;
        if (direction === 'prev') {
          newIndex = Math.max(0, prevIdx - 1);
        } else {
          newIndex = Math.min(total - 1, prevIdx + 1);
        }
        
        setIsAutoFollowPaused(true);
        userScrolledAwayRef.current = true;
        
        setTimeout(() => {
          const blockEl = document.getElementById(\`timeline-block-\${newIndex}\`);
          if (blockEl && timelineScrollRef.current) {
            isProgrammaticScrollRef.current = true;
            blockEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            setTimeout(() => {
              isProgrammaticScrollRef.current = false;
            }, 500);
          }
        }, 10);

        return newIndex;
      });
      return prevBlockchain;
    });
  }, []);

  useEffect(() => {
    if (activeVisualizerView !== 'timeline') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateTimeline('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateTimeline('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVisualizerView, navigateTimeline]);

  const handleTimelineScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current) return;
    if (timelineScrollRef.current) {
      const el = timelineScrollRef.current;
      const distanceFromEnd = el.scrollWidth - el.clientWidth - el.scrollLeft;
      
      const centerPos = el.scrollLeft + el.clientWidth / 2;
      let closestIdx = 0;
      let minDiff = Infinity;
      
      const children = Array.from(el.children);
      children.forEach((child) => {
        if (child.id && child.id.startsWith('timeline-block-')) {
          const htmlChild = child;
          const childCenter = htmlChild.offsetLeft + htmlChild.offsetWidth / 2;
          const diff = Math.abs(childCenter - centerPos);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = parseInt(htmlChild.id.replace('timeline-block-', ''), 10);
          }
        }
      });
      
      if (!isNaN(closestIdx)) {
        setFocusedBlockIndex(closestIdx);
      }

      if (distanceFromEnd > 140) {
        userScrolledAwayRef.current = true;
        setIsAutoFollowPaused(true);
      } else if (distanceFromEnd < 40) {
        userScrolledAwayRef.current = false;
        setIsAutoFollowPaused(false);
      }
    }
  }, []);
`;

if (scrollFunctionStart !== -1 && scrollFunctionEnd !== -1) {
  content = content.substring(0, scrollFunctionStart) + newScrollLogic + "\n" + content.substring(scrollFunctionEnd);
}

fs.writeFileSync('src/components/ProofOfWork/PowLesson.tsx', content);

import { RefObject, useEffect } from 'react';

export function useTableScrollListener(
  tableWrapperRef: RefObject<HTMLDivElement>
) {
  useEffect(() => {
    if (!tableWrapperRef.current) return;

    const scrollableElement = tableWrapperRef.current.querySelector(
      '.ant-table-body'
    ) as HTMLElement;
    console.log({ scrollableElement });

    if (!scrollableElement) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.scrollTop > 0) {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }
      console.log({
        scrollTop: target.scrollTop,
        clientHHeight: target.clientHeight,
        scrollHeight: target.scrollHeight
      });
    };

    scrollableElement.addEventListener('scroll', handleScroll);
    return () => {
      scrollableElement.removeEventListener('scroll', handleScroll);
    };
  }, [tableWrapperRef]);
}

import { useEffect } from 'react';

const SITE_NAME = 'BTS Logistique';

export function useDocumentTitle(pageTitle: string) {
  useEffect(() => {
    document.title = `${pageTitle} | ${SITE_NAME}`;
  }, [pageTitle]);
}

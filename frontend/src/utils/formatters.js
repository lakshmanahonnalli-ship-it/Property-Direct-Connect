export const formatPrice = (price, purpose = 'sale') => {
  if (price === undefined || price === null) return '₹0';

  const num = Number(price);

  if (purpose === 'rent') {
    return `₹${num.toLocaleString('en-IN')}/mo`;
  }

  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
  } else if (num >= 100000) {
    const lakh = num / 100000;
    return `₹${lakh.toFixed(2).replace(/\.00$/, '')} Lakh`;
  }

  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const truncateText = (str, maxLength = 100) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

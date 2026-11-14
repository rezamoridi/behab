export const getCdseCredentialStatus = async () => {
  const res = await apiClient.get('/sentinel/credentials');
  return res.data;
};

export const setCdseCredential = async ({ email, password }) => {
  const res = await apiClient.post('/sentinel/credentials', {
    email, password,
  });
  return res.data;
};

export const clearCdseCredential = async () => {
  const res = await apiClient.delete('/sentinel/credentials');
  return res.data;
};

export const downloadGeotiffAsFile = async (assetId, filename) => {
  const blob = await fetchGeotiffBlob(assetId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `sentinel_${assetId}.tif`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};
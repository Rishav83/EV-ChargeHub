// Simple logging utility
export const logEvent = (eventName, data = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event: eventName,
    ...data
  };
  
  console.log('LOG_ENTRY:', JSON.stringify(logEntry));
  
  // In a production environment, you would send this to a logging service
  // For now, we'll just store in localStorage for persistence
  try {
    const existingLogs = JSON.parse(localStorage.getItem('appLogs') || '[]');
    existingLogs.push(logEntry);
    
    // Keep only the last 1000 logs to prevent storage issues
    if (existingLogs.length > 1000) {
      existingLogs.splice(0, existingLogs.length - 1000);
    }
    
    localStorage.setItem('appLogs', JSON.stringify(existingLogs));
  } catch (error) {
    console.error('Failed to save log entry:', error);
  }
};

export const getLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('appLogs') || '[]');
  } catch (error) {
    console.error('Failed to retrieve logs:', error);
    return [];
  }
};
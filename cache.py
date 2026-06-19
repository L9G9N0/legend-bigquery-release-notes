import os
import json
import time
import logging
import threading

logger = logging.getLogger("release_notes_explorer")

class FileBackedCache:
    """
    A thread-safe, file-backed cache mechanism for storing parsed release notes.
    Prevents frequent external API hits and survives application restarts.
    """
    def __init__(self, cache_filepath="release_notes_cache.json", default_expiry_seconds=300):
        self.filepath = cache_filepath
        self.expiry_duration = default_expiry_seconds
        self.lock = threading.Lock()
        self._memory_data = None
        self._memory_timestamp = 0

    def get(self):
        """
        Retrieves cached data. Validates expiration.
        Returns (data, is_stale) or (None, True) if no cache exists.
        """
        with self.lock:
            now = time.time()
            
            # 1. Try memory cache first
            if self._memory_data and (now - self._memory_timestamp < self.expiry_duration):
                logger.info("Serving valid cache from in-memory store.")
                return self._memory_data, False
                
            # 2. Try file cache fallback
            if os.path.exists(self.filepath):
                try:
                    with open(self.filepath, 'r') as f:
                        cached_obj = json.load(f)
                    
                    data = cached_obj.get('data')
                    timestamp = cached_obj.get('timestamp', 0)
                    
                    # Update memory representation
                    self._memory_data = data
                    self._memory_timestamp = timestamp
                    
                    if now - timestamp < self.expiry_duration:
                        logger.info("Serving valid cache from disk storage.")
                        return data, False
                    else:
                        logger.warning("Disk cache found but it has expired.")
                        return data, True  # Stale data returned for graceful degradation
                except Exception as err:
                    logger.error(f"Error reading cache file from disk: {err}")
            
            # 3. No cache available
            return None, True

    def set(self, data):
        """
        Saves fresh data to both memory and file cache storage.
        """
        with self.lock:
            now = time.time()
            self._memory_data = data
            self._memory_timestamp = now
            
            cached_obj = {
                'timestamp': now,
                'data': data
            }
            
            try:
                with open(self.filepath, 'w') as f:
                    json.dump(cached_obj, f, indent=2)
                logger.info("Successfully updated disk and memory cache.")
            except Exception as err:
                logger.error(f"Failed to write cache file to disk: {err}")

    def clear(self):
        """
        Clears both memory and file cache.
        """
        with self.lock:
            self._memory_data = None
            self._memory_timestamp = 0
            if os.path.exists(self.filepath):
                try:
                    os.remove(self.filepath)
                    logger.info("Cache files cleared successfully.")
                except Exception as err:
                    logger.error(f"Failed to remove cache file: {err}")

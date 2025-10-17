# import os
# from pymongo import MongoClient
# from django.conf import settings

# MONGO_URI = getattr(settings, 'MONGO_URI', 'mongodb://localhost:27017/')
# MONGO_DB_USER = getattr(settings, 'MONGO_DB_USER', 'smart_farming_user')

# class MongoDB:
#     def __init__(self):
#         self.client = None
#         self.db = None

#     def connect(self):
#         if not self.client:
#             self.client = MongoClient(MONGO_URI)
#             self.db = self.client.get_database(MONGO_DB_USER)
#         return self.db

#     def get_collection(self, collection_name):
#         db = self.connect()
#         return db[collection_name]

#     def close_connection(self):
#         if self.client:
#             self.client.close()
#             self.client = None
#             self.db = None


# # mongo = MongoDB()

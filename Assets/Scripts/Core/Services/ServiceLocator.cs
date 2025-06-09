using System;
using System.Collections.Generic;
using UnityEngine;

namespace Core.Services
{
    public static class ServiceLocator
    {
        private static readonly Dictionary<Type, IService> Services = new Dictionary<Type, IService>();

        public static void Register<T>(T service) where T : IService
        {
            var type = typeof(T);
            if (Services.ContainsKey(type))
            {
                Debug.LogError($"Service of type {type} already registered.");
                return;
            }
            Services.Add(type, service);
        }

        public static T Get<T>() where T : IService
        {
            var type = typeof(T);
            if (!Services.TryGetValue(type, out var service))
            {
                Debug.LogError($"Service of type {type} not found.");
                return default;
            }
            return (T)service;
        }

        public static void Unregister<T>() where T : IService
        {
            var type = typeof(T);
            if (!Services.ContainsKey(type))
            {
                Debug.LogWarning($"Service of type {type} not registered, cannot unregister.");
                return;
            }
            Services.Remove(type);
        }
    }
}

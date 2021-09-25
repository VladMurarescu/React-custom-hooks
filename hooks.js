import axios from "axios";
import { useState, useEffect, useRef } from "react";

export const useArray = (defaultValue) => {
  const [array, setArray] = useState(defaultValue);

  const set = (array) => setArray(array);

  const push = (element) => setArray((prevState) => [...prevState, element]);

  const remove = (index) =>
    setArray((prevState) => [
      ...prevState.slice(0, index),
      ...prevState.slice(index + 1),
    ]);

  const filter = (callback) =>
    setArray((prevState) => prevState.filter(callback));

  const update = (index, element) =>
    setArray((prevState) => [
      ...prevState.slice(0, index),
      element,
      ...prevState.slice(index),
    ]);
  const clear = () => setArray([]);

  return [array, set, push, remove, filter, update, clear];
};

export const useToggle = (defaultValue) => {
  const [value, setValue] = useState(defaultValue);

  const toggleValue = (value) => {
    setValue((prevState) => (typeof value === "boolean" ? value : !prevState));
  };

  return [value, toggleValue];
};

const useMountedRef = () => {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  });

  return mounted;
};

// export const useFetch = (url) => {
//   const mounted = useMountedRef();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState();
//   const [data, setData] = useState();

//   useEffect(() => {
//     if (!url) return;
//     setLoading(true);

//     fetch(url)
//       .then((data) => {
//         if (!mounted.current) throw new Error("Component is not mounted!");
//       })
//       .then((data) => data.json())
//       .then(setData)
//       .then(() => setLoading(false))
//       .catch((error) => {
//         if (!mounted.current) return;
//         setError(error);
//         setLoading(false);
//       });
//   }, [url, mounted]);

//   return [loading, error, data];
// };

export const useFetch = (url, options) => {
  const mounted = useMountedRef();
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await fetch(url, options);
        if (!mounted.current) throw new Error("Component is not mounted!");
        const json = await res.json();
        setResponse(json);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchData();
  }, [url, options]);

  return [loading, error, response];
};

export const useAxios = (url) => {
  const mounted = useMountedRef();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [data, setData] = useState();

  useEffect(() => {
    if (!url) return;
    setLoading(true);

    axios
      .get(url)
      .then((response) => {
        if (!mounted.current) throw new Error("Component is not mounted!");
        if (response && "data" in response) {
          setData(response.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        setError(error + "");
        setLoading(false);
      });
  }, [url, mounted]);

  return [loading, error, data];
};

export const useStorage = (
  key,
  defaultValue = "",
  storageObject = localStorage
) => {
  const [value, setValue] = useState(() => {
    const storageValue = storageObject.getItem(key);
    const currentValue =
      typeof defaultValue === "function" ? defaultValue() : defaultValue;

    if (storageValue !== null) return JSON.parse(storageValue);

    storageObject.setItem(key, JSON.stringify(currentValue));
    return JSON.parse(storageObject.getItem(key));
  });

  const setStorageValue = (value) => {
    storageObject.setItem(key, JSON.stringify(value));
    setValue(JSON.parse(storageObject.getItem(key)));
  };

  const removeStorageValue = (key) => {
    storageObject.removeItem(key);
    setValue(undefined);
  };

  return [value, setStorageValue, removeStorageValue];
};

export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;

      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export const useClickInside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export const useEventListener = (type, handler, el = window) => {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (e) => savedHandler.current(e);

    el.addEventListener(type, listener);

    return () => {
      el.removeEventListener(type, listener);
    };
  }, [type, el]);
};

export const useTimeout = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };
    if (delay !== null) {
      let id = setTimeout(tick, delay);
      return () => clearTimeout(id);
    }
  }, [delay]);
};

export const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

import React, { useState, useEffect, useRef } from 'react';

const initialColumns = [
  { id: 'userId', label: 'User Id' },
  { id: 'id', label: 'Todo Id' },
  { id: 'title', label: 'Title' },
];

function Index() {
  const [apiData, setApiData] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('title');
  const [searchInput, setSearchInput] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [columns, setColumns] = useState(initialColumns);
  const [isEditing, setIsEditing] = useState(null);
  const [editData, setEditData] = useState({});

  const dropdownRef = useRef(null);

  async function apiCalling() {
    const url = 'https://jsonplaceholder.typicode.com/todos';
    try {
      const res = await fetch(url);
      if (res.status === 200) {
        const data = await res.json();
        setApiData(data);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  }

  useEffect(() => {
    apiCalling();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter data based on the selected category and search input
  const filteredData = apiData?.filter((item) => {
    const value = item[selectedCategory]?.toString()?.toLowerCase();
    return value?.includes(searchInput.toLowerCase());
  });

  const sortedFilteredData = [...filteredData].sort((a, b) => {
    if (sortConfig.key) {
      let comparison = 0;
      if (a[sortConfig.key] > b[sortConfig.key]) {
        comparison = 1;
      } else if (a[sortConfig.key] < b[sortConfig.key]) {
        comparison = -1;
      }
      return sortConfig.direction === 'ascending' ? comparison : -comparison;
    }
    return 0;
  });





  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = sortedFilteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('columnIndex', index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = e.dataTransfer.getData('columnIndex');
    const updatedColumns = [...columns];
    const [movedColumn] = updatedColumns.splice(dragIndex, 1);
    updatedColumns.splice(dropIndex, 0, movedColumn);
    setColumns(updatedColumns);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleEdit = (item) => {
    setIsEditing(item.id);
    setEditData({ ...item });
  };

  const handleDelete = (id) => {
    setApiData(apiData.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    setApiData(apiData.map((item) =>
      item.id === editData.id ? editData : item
    ));
    setIsEditing(null);
  };

  const handleCancel = () => {
    setIsEditing(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  return (
    <React.Fragment>
      <form className="w-full px-24 mt-4">
        <div className="flex">
          <label htmlFor="search-dropdown" className="mb-2 text-sm font-medium text-gray-900 sr-only">
            Search
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              id="dropdown-button"
              className="flex-shrink-0 capitalize w-44 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg"
              type="button"
              onClick={() => setDropdownVisible(!dropdownVisible)}
            >
              {selectedCategory}
              <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
              </svg>
            </button>
            {dropdownVisible && (
              <div id="dropdown" className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdown-button">
                  <li>
                    <button onClick={() => { setSelectedCategory('id'); setSearchInput(''); setDropdownVisible(false) }} type="button" className="inline-flex w-full px-4 py-2 text-black hover:bg-gray-100">
                      Id
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setSelectedCategory('userId'); setSearchInput(''); setDropdownVisible(false) }} type="button" className="inline-flex w-full px-4 py-2 text-black hover:bg-gray-100">
                      UserId
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setSelectedCategory('title'); setSearchInput(''); setDropdownVisible(false) }} type="button" className="inline-flex w-full px-4 py-2 text-black hover:bg-gray-100">
                      Title
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div className="relative w-full">
            <input
              type="search"
              id="search-dropdown"
              className="outline-none block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              required
            />

          </div>
        </div>
      </form>

      <div className="px-24 pt-8">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr className="text-center">
              {columns.map((column, index) => (
                <th
                  key={column.id}
                  scope="col"
                  className="px-6 py-3 cursor-pointer"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragOver={handleDragOver}
                  onClick={() => handleSort(column.id)}
                >
                  {column.label}
                  <span className="ml-2">
                    {sortConfig.key === column.id ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '⇵'}
                  </span>
                </th>
              ))}
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id} className="border-b bg-white hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.id} className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {isEditing === item.id ? (
                      column.id === 'title' ? (
                        <input
                          type="text"
                          name="title"
                          value={editData[column.id]}
                          onChange={handleInputChange}
                          className="w-full px-3 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        item[column.id]
                      )
                    ) : (
                      item[column.id]
                    )}
                  </td>
                ))}
                <td className="px-6 py-4">
                  {isEditing === item.id ? (
                    <>
                      <button onClick={handleSave} className="px-4 py-1 text-white bg-green-600 rounded">Save</button>
                      <button onClick={handleCancel} className="px-4 py-1 text-white bg-red-600 rounded ml-2">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(item)} className="px-4 py-1 text-white bg-yellow-600 rounded">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="px-4 py-1 text-white bg-red-600 rounded ml-2">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 m-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 m-1 ${currentPage === index + 1 ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'} rounded`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 m-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Index;

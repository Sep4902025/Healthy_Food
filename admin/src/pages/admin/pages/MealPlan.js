import React, { useState } from 'react';
import { 
  EditIcon,
  TrashIcon,
  PlusIcon
} from 'lucide-react';

// Sample meal plan data
const initialMealPlans = [
  { 
    id: 1, 
    programName: 'G.C Cùng LDP', 
    goal: 'Weight Loss', 
    userCount: 112,
    duration: '1 Week',
    status: 'Active',
    image: '/api/placeholder/40/40'
  },
  { 
    id: 2, 
    programName: 'TC 1 Month', 
    goal: 'Weight Gain', 
    userCount: 96,
    duration: '4 Week',
    status: 'Active',
    image: '/api/placeholder/40/40'
  },
  { 
    id: 3, 
    programName: 'Tăng Cơ Bự', 
    goal: 'Muscle Gain', 
    userCount: 202,
    duration: '12 Week',
    status: 'Active',
    image: '/api/placeholder/40/40'
  },
  { 
    id: 4, 
    programName: 'G.C Cùng LDP', 
    goal: 'Weight Loss', 
    userCount: 122,
    duration: '2 Week',
    status: 'Active',
    image: '/api/placeholder/40/40'
  },
  { 
    id: 5, 
    programName: 'G.C Cùng LDP', 
    goal: 'Weight Loss', 
    userCount: 122,
    duration: '3 Week',
    status: 'Active',
    image: '/api/placeholder/40/40'
  }
];

const MealPlan = () => {
  const [mealPlans, setMealPlans] = useState(initialMealPlans);


  const handleDeleteMealPlan = (id) => {
    setMealPlans(mealPlans.filter(plan => plan.id !== id));
  };

  return (
    <div className="flex h-screen">

      {/* Main Content */}
      <div className="flex-grow flex flex-col">

        {/* Meal Plan Content */}
        <div className="flex-grow p-6 bg-gray-100 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Meal Plan</h1>
              <p className="text-gray-500">Hi, Samantha. Welcome back to Sedap Admin!</p>
            </div>
            <div>
              <button className="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center">
                <PlusIcon className="mr-2" size={20} />
                Create Meal
              </button>
            </div>
          </div>

          {/* Meal Plan Table */}
          <div className="bg-white rounded-lg shadow-md">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left text-gray-500">Program Name</th>
                  <th className="p-4 text-left text-gray-500">Goal</th>
                  <th className="p-4 text-left text-gray-500">User Count</th>
                  <th className="p-4 text-left text-gray-500">Duration</th>
                  <th className="p-4 text-left text-gray-500">Status</th>
                  <th className="p-4 text-left text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mealPlans.map((plan) => (
                  <tr key={plan.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 flex items-center">
                      <img 
                        src={plan.image} 
                        alt={plan.programName} 
                        className="w-10 h-10 rounded-full mr-3" 
                      />
                      {plan.programName}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        plan.goal === 'Weight Loss' ? 'bg-pink-100 text-pink-600' :
                        plan.goal === 'Weight Gain' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {plan.goal}
                      </span>
                    </td>
                    <td className="p-4 flex items-center">
                      <span className="mr-1">👥</span>
                      {plan.userCount}
                    </td>
                    <td className="p-4">{plan.duration}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        plan.status === 'Active' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                      }`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="p-4 flex space-x-2">
                      <button className="text-green-500 hover:bg-green-100 p-2 rounded-full">
                        <EditIcon size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMealPlan(plan.id)}
                        className="text-red-500 hover:bg-red-100 p-2 rounded-full"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span>Show</span>
                <select className="border rounded px-2 py-1">
                  <option>5 Users</option>
                  <option>10 Users</option>
                  <option>20 Users</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button className="border rounded px-3 py-1 hover:bg-gray-100">&lt;</button>
                <button className="bg-green-500 text-white px-3 py-1 rounded">1</button>
                <button className="border rounded px-3 py-1 hover:bg-gray-100">2</button>
                <button className="border rounded px-3 py-1 hover:bg-gray-100">3</button>
                <button className="border rounded px-3 py-1 hover:bg-gray-100">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlan;
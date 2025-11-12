import React, { useState } from 'react';
import type { Resource, ResourceType } from '../types';

interface ResourceLibraryProps {
  resources: Resource[];
  onAddResource: (resource: Omit<Resource, 'id'>) => void;
}

const resourceTypes: ResourceType[] = ['Article', 'Video', 'Link', 'Document'];

export const ResourceLibrary: React.FC<ResourceLibraryProps> = ({ resources, onAddResource }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<ResourceType>('Link');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddResource({ title, description, url, category, type });
    setTitle('');
    setDescription('');
    setUrl('');
    setCategory('');
    setType('Link');
    setShowForm(false);
  };
  
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Resource Library</h2>
        <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
            {showForm ? 'Cancel' : '+ Add Resource'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg mb-8 animate-fade-in">
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">Add New Resource</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="bg-gray-700 p-2 rounded-md border border-gray-600"/>
                <input type="text" placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} required className="bg-gray-700 p-2 rounded-md border border-gray-600"/>
                <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required className="bg-gray-700 p-2 rounded-md border border-gray-600"/>
                <select value={type} onChange={e => setType(e.target.value as ResourceType)} className="bg-gray-700 p-2 rounded-md border border-gray-600">
                    {resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="md:col-span-2 bg-gray-700 p-2 rounded-md border border-gray-600" rows={3}/>
                <div className="md:col-span-2 text-right">
                    <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-md transition-colors">Save</button>
                </div>
            </form>
        </div>
      )}

      {resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <div key={resource.id} className="bg-gray-800 p-4 rounded-lg flex flex-col justify-between shadow-md hover:shadow-cyan-500/20">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-white mb-1">{resource.title}</h3>
                        <span className="bg-cyan-800 text-cyan-200 text-xs font-semibold px-2 py-0.5 rounded-full">{resource.type}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{resource.category}</p>
                    <p className="text-sm text-gray-300 mb-4">{resource.description}</p>
                </div>
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-center bg-gray-700 hover:bg-gray-600 text-cyan-300 font-semibold py-2 px-4 rounded-md transition-colors text-sm">
                    View Resource
                </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800 rounded-lg">
            <h3 className="text-xl text-gray-400">The library is empty.</h3>
            <p className="text-gray-500 mt-2">Click "Add Resource" to start building your library.</p>
        </div>
      )}
    </div>
  );
};

# Total Reps API Documentation

## Endpoint: Get Total Reps Performed by All Users

**URL:** `GET /api/v2/exercise/total-reps`

**Description:** Returns the sum of all reps performed by all users across all exercises in the database.

### Request

**Method:** `GET`

**Headers:** None required (public endpoint)

**URL:** 
```
https://final-z80k.onrender.com/api/v2/exercise/total-reps
```

### Response

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "totalReps": 15432
  },
  "message": "Total reps calculated successfully.",
  "success": true
}
```

**Fields:**
- `totalReps` (Number): The sum of all `reps_performed` across all exercises in the database

### Implementation Details

The endpoint uses MongoDB aggregation to efficiently calculate the sum:

```javascript
const result = await Exercise.aggregate([
  {
    $group: {
      _id: null,
      totalReps: { $sum: "$reps_performed" }
    }
  }
]);
```

### Usage Examples

#### JavaScript/React Native (Axios)
```javascript
import axios from 'axios';

const getTotalReps = async () => {
  try {
    const response = await axios.get(
      'https://final-z80k.onrender.com/api/v2/exercise/total-reps'
    );
    
    console.log('Total reps:', response.data.data.totalReps);
    return response.data.data.totalReps;
  } catch (error) {
    console.error('Error fetching total reps:', error);
    return 0;
  }
};
```

#### cURL
```bash
curl -X GET https://final-z80k.onrender.com/api/v2/exercise/total-reps
```

#### Fetch API
```javascript
fetch('https://final-z80k.onrender.com/api/v2/exercise/total-reps')
  .then(response => response.json())
  .then(data => {
    console.log('Total reps:', data.data.totalReps);
  })
  .catch(error => console.error('Error:', error));
```

### Notes

- This endpoint counts ALL reps from ALL users (both regular and focused exercises)
- The count includes both perfect and imperfect reps
- Returns `0` if no exercises exist in the database
- This is a public endpoint and doesn't require authentication
- The calculation is performed in real-time using database aggregation

### Related Endpoints

- `POST /api/v2/exercise/save` - Save a new exercise
- `GET /api/v2/exercise/getAll/:userId` - Get all exercises for a specific user
- `POST /api/v2/exercise/saveFocus` - Save a focused exercise

### File Locations

- **Controller:** `/server/src/controllers/exercise.controller.js` (line 224-241)
- **Route:** `/server/src/routes/exercise.routes.js` (line 11)
- **Model:** `/server/src/models/exercise.model.js`
